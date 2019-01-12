var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var destinationModel = new Schema({
  userId: {
    type: ObjectId
  },
  name: {
    type: String
  },
  address: {
    type: String
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  milesFromHome: {
    type: Number
  },

});

module.exports = mongoose.model('Destination', destinationModel);


