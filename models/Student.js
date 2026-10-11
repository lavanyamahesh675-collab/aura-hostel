const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [8, 'Name must be at least 8 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Phone number must be strictly 10 digits']
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  department: {
    type: String,
    default: 'Computer Science'
  },
  academicYear: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'],
    default: '3rd Year'
  },
  rollNumber: {
    type: String,
    trim: true,
    default: ''
  },
  guardianName: {
    type: String,
    default: ''
  },
  guardianContact: {
    type: String,
    default: ''
  },
  emergencyContact: {
    type: String,
    default: ''
  },
  block: {
    type: String,
    required: true,
    enum: ['Block A', 'Block B', 'Block C', 'Block D']
  },
  roomNo: {
    type: String,
    required: true,
    trim: true
  },
  bedNumber: {
    type: String,
    default: 'Bed-1'
  },
  roomRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  messPreference: {
    type: String,
    enum: ['Vegetarian', 'Non-Vegetarian', 'Special Diet'],
    default: 'Vegetarian'
  },
  feeStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue'],
    default: 'Pending'
  },
  studentStatus: {
    type: String,
    enum: ['Active', 'Graduated', 'Suspended', 'Vacated'],
    default: 'Active'
  },
  userRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  avatar: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);
