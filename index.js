const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid/v4');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');

const Auth = require('./models/authModel');
const Destination = require('./models/destinationModel');
const Metadata = require('./models/travelMetadataModel');
const mongoose = require('mongoose');
const db = mongoose.connect('mongodb://localhost/mileageProject', {useNewUrlParser: true});
const authModel = mongoose.model('Auth', mongoose.schema);

const app = express();
const port = 8080;

passport.use(new localStrategy(
  { usernameField: 'username' },
  (username, password, done) => {
    const user = authModel.findOne({username}, (err, auth) => {
      if(err || !auth) {
        return done(null, false, {message: 'Invalid credentials'});
      }
      if (username === auth.username && bcrypt.compareSync(password, auth.password)) {
        return done(null, auth);
      } else {
        return done(null, false, {message: 'Invalid credentials'});
      }
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser((id, done) => {
  authModel.findById(id, (err, user) => {
    done(null, user);
  })
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  genid: (req) => {
    return uuid();
  },
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  secret: 'make this more secure',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  if(req.session.page_views) {
    req.session.page_views++;
    console.log('visited ' + req.session.page_views + ' times');
  } else {
    req.session.page_views = 1;
    console.log('first time visitor');
  }
  console.log('user joined / page');
  res.sendFile('pages/login.html', {root: __dirname});
});

app.post('/login', (req, res) => {
  console.log('user called login post');
  passport.authenticate('local', (err, user, info) => {
    if (info) return res.send(info.message);
    if (err) return next(err);
    if(!user) return res.redirect('/');
    req.login(user, (err) => {
      if(err) return next(err);
      return res.redirect('/mileage');
    })
  })(req, res);
});

app.get('/signup', (req, res) => {
  console.log('user called signup get');
  res.sendFile('pages/signup.html', {root: __dirname});
});

app.post('/signup', (req, res) => {
  console.log('user called signup post');
  const username = req.body.username;
  const password = req.body.password;
  const hash = bcrypt.hashSync(password);
  const query = {};
  query.username = username;
  authModel.findOne(query, (err, auth) => {
    if(auth) {
      res.send('user already found');
    } else {
      const newUser = new Auth({username, password: hash});
      newUser.save();
      res.redirect('/');
    }
  });
})

app.post('/mileage/destination', (req, res) => {
  console.log('user called mileage/destination post');
  if(!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }
  const query = {userId: req.user.id, name: req.body.name};
  Destination.findOne(query, (err, dest) => {
    if(!dest) {
      req.body.userId = req.user.id;
      const destination = new Destination(req.body);
      destination.save();
      res.status(200).send('OK');
    } else {
      console.log('already found one');
      res.status(409).send('Data already in DB');
    }
  });
});

app.delete('/mileage/destination', (req, res) => {
  console.log('user called mileage/destination delete');
  if(!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }
  const query = {userId: req.user.id, name: req.body.name};
  Destination.deleteOne(query, (err) => {
    if(err) {
      console.log(err);
      res.status(204).send('Element already deleted');
    } else {
      console.log('Row removed from DB');
      res.status(200).send('OK');
    }
  })
});

app.get('/mileage/destination', (req, res) => {
  console.log('user called mileage/destination get');
  if(!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }
  const query = {userId: req.user.id};
  Destination.find(query, (err, destinations) => {
    if (err) {
      console.log(err);
    }
    res.send(destinations);
  })
});

app.post('/mileage/metadata', (req, res) => {
  console.log('user called mileage/metadata post');
  if(!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }
  const query = {userId: req.user.id};
  req.body.userId = req.user.id;
  Metadata.findOne(query, (err, data) => {
    if(data) {
      data.startMileage = req.body.startMileage;
      data.endMileage = req.body.endMileage;
      data.lowerBoundTripsPerDay = req.body.lowerBoundTripsPerDay;
      data.upperBoundTripsPerDay = req.body.upperBoundTripsPerDay;
      data.percentageIllWork = req.body.percentageIllWork;
      Metadata.updateOne(query, data, err => {
        if(err) {
          console.log('Error in saving metadata');
          console.log(err);
        } else {
          console.log('updated metadata');
          res.status(200).send('OK');
        }
      });
    } else {
      const data = new Metadata(req.body);
      data.save( err => {
        if(err) {
          console.log(err);
        } else {
          console.log('saved new data');
          res.status(200).send('OK');
        }
      });
    }
  })
});

app.get('/mileage/metadata', (req, res) => {
  console.log('user called mileage/metadata get');
  if(!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }
  const query = {userId: req.user.id};
  Metadata.findOne(query, (err, data) => {
    if(err) {
      console.log('error getting metadata');
      res.status(404).send('Not found in DB');
    } else {
      res.status(200).send(data);
    }
  })
});

app.delete('/mileage/metadata', (req, res) => {
  console.log('user called mileage/metadata delete');
  if(!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }
  const query = {userId: req.user.id};
  Metadata.deleteMany(query, (err, data) => {
    if(err) {
      console.log('error deleting metadata');
      res.status(404).send('Not found in DB');
    } else {
      res.status(200).send(data);
    }
  });
});

app.get('/mileage.js', (req, res) => {
  if(!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }
  res.sendFile('pages/mileage.js', {root: __dirname});
});

app.get('/mileage', (req, res) => {
  console.log('user called mileage html page');
  if(!req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.sendFile('pages/mileage.html', {root: __dirname});
  }
});

app.get('/logout', (req, res) => {
  console.log('user logged out');
  res.send('Logged out successfully');
  req.session.destroy();
});

app.listen(port, () => {
  console.log('App running');
});
