const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  studentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: false
  },
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentFor: {
    type: String,
    enum: ['Hostel Fee', 'Mess Fee', 'Maintenance Deposit', 'Fine'],
    default: 'Hostel Fee'
  },
  month: {
    type: String,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Credit Card', 'Net Banking', 'Cash'],
    default: 'UPI'
  },
  transactionRef: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed'],
    default: 'Paid'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
