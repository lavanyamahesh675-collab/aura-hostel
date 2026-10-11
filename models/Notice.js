const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  noticeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Academic', 'Mess', 'Maintenance', 'Emergency', 'General'],
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['Normal', 'Important', 'Urgent'],
    default: 'Normal'
  },
  audience: {
    type: String,
    enum: ['All', 'Block A', 'Block B', 'Block C', 'Block D', 'Students', 'Wardens'],
    default: 'All'
  },
  createdBy: {
    type: String,
    default: 'Chief Warden'
  },
  publishedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: null
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
