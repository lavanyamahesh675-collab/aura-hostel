const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const PaymentService = require('../services/paymentService');
const { memoryStore, isDbConnected } = require('../config/db');

// Initial seed payments for memory store
const seedPayments = [
  {
    receiptNo: 'REC-901001',
    studentId: 'STU-1001',
    studentName: 'Alexander Johnson',
    amount: 8000,
    paymentFor: 'Hostel Fee',
    month: 'October 2026',
    paymentDate: new Date('2026-10-01'),
    paymentMethod: 'UPI',
    transactionRef: 'TXN-99881122',
    status: 'Paid'
  },
  {
    receiptNo: 'REC-901002',
    studentId: 'STU-1002',
    studentName: 'Sophia Martinez',
    amount: 6000,
    paymentFor: 'Hostel Fee',
    month: 'October 2026',
    paymentDate: new Date('2026-10-02'),
    paymentMethod: 'Net Banking',
    transactionRef: 'TXN-44556677',
    status: 'Paid'
  },
  {
    receiptNo: 'REC-901003',
    studentId: 'STU-1004',
    studentName: 'Emily Watson',
    amount: 4500,
    paymentFor: 'Mess Fee',
    month: 'October 2026',
    paymentDate: new Date('2026-10-04'),
    paymentMethod: 'Credit Card',
    transactionRef: 'TXN-11223344',
    status: 'Paid'
  }
];

if (!memoryStore.payments || memoryStore.payments.length === 0) {
  memoryStore.payments = [...seedPayments];
}

// GET /api/payments
router.get('/', async (req, res) => {
  try {
    const { studentId, status } = req.query;

    if (isDbConnected()) {
      let query = {};
      if (studentId) query.studentId = studentId;
      if (status) query.status = status;
      const payments = await Payment.find(query).sort({ paymentDate: -1 });
      return res.json({ success: true, count: payments.length, data: payments });
    } else {
      let results = memoryStore.payments;
      if (studentId) results = results.filter(p => p.studentId === studentId);
      if (status) results = results.filter(p => p.status === status);
      return res.json({ success: true, count: results.length, data: results });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/payments
router.post('/', async (req, res) => {
  try {
    const { studentId, studentName, amount, paymentFor, month, paymentMethod, transactionRef } = req.body;

    if (!studentId || !studentName || !amount) {
      return res.status(400).json({ success: false, message: 'Student ID, Student Name, and Amount are required' });
    }

    const recorded = await PaymentService.recordPayment({
      studentId,
      studentName,
      amount: Number(amount),
      paymentFor,
      month,
      paymentMethod,
      transactionRef
    });

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully and fee status updated!',
      data: recorded
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/payments/:id/receipt
router.get('/:id/receipt', async (req, res) => {
  try {
    const { id } = req.params;
    let payment = memoryStore.payments.find(p => p.receiptNo === id || p._id === id);
    if (!payment) return res.status(404).json({ success: false, message: 'Receipt not found' });
    return res.json({ success: true, receipt: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
