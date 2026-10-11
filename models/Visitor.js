const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  visitorName: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Contact number must be 10 digits']
  },
  studentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: false
  },
  studentName: {
    type: String,
    required: true
  },
  roomNo: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['Inside', 'Checked Out'],
    default: 'Inside'
  },
  authorizationStatus: {
    type: String,
    enum: ['Approved', 'Pending', 'Denied'],
    default: 'Approved'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);
