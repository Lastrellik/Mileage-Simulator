var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authModel = new Schema({
    username: {
        type: String
    },
    password: {
        type: String
    }
});

module.exports = mongoose.model('Auth', authModel);

