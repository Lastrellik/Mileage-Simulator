var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var travelMetadataModel = new Schema({
  userId: {
    type: ObjectId
  },
  startMileage: {
    type: Number
  },
  endMileage: {
    type: Number
  }
});

module.exports = mongoose.model('travelMetadata', travelMetadataModel);

