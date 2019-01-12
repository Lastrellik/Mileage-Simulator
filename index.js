const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid/v4');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');

const Auth = require('./models/authModel');
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
  res.sendFile('pages/login.html', {root: __dirname});
});

app.post('/login', (req, res) => {
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
  res.sendFile('pages/signup.html', {root: __dirname});
});

app.post('/signup', (req, res) => {
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
  console.log(req.body);
  res.status(200).send('OK');
});

app.get('/authrequired', (req, res) => {
  if(req.isAuthenticated()) {
    res.send('you hit the authentication endpoint');
    console.log(req.session);
  } else {
    res.redirect('/');
  }
});

app.get('/test.js', (req, res) => {
  console.log('sent the file');
  res.sendFile('pages/test.js', {root: __dirname});
});

app.get('/mileage', (req, res) => {
  console.log("is authenticated? " + req.isAuthenticated());
  if(!req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.sendFile('pages/mileage.html', {root: __dirname});
  }
});

app.get('/logout', (req, res) => {
  res.send('Logged out successfully');
  req.session.destroy();
});
app.listen(port, () => {
  console.log('App running');
});
