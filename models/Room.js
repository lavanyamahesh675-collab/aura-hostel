const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  block: {
    type: String,
    required: true,
    enum: ['Block A', 'Block B', 'Block C', 'Block D']
  },
  floor: {
    type: Number,
    required: true,
    default: 1
  },
  type: {
    type: String,
    required: true,
    enum: ['Single', 'Double', 'Triple', 'Four-sharing', 'Accessible', 'Suite']
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  occupied: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlyFee: {
    type: Number,
    required: true,
    default: 5000
  },
  amenities: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Available', 'Full', 'Maintenance'],
    default: 'Available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema);
