const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: false
  },
  studentId: {
    type: String,
    required: true,
    index: true
  },
  studentName: {
    type: String,
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'On Leave'],
    required: true,
    default: 'Present'
  },
  checkInTime: {
    type: String,
    default: '21:00'
  },
  checkOutTime: {
    type: String,
    default: '07:00'
  },
  remarks: {
    type: String,
    default: ''
  },
  markedBy: {
    type: String,
    default: 'System Warden'
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
