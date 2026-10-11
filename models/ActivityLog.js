const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  user: {
    type: String,
    default: 'System'
  },
  userRole: {
    type: String,
    default: 'Warden'
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
