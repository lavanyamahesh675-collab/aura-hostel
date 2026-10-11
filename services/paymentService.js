const Payment = require('../models/Payment');
const Student = require('../models/Student');
const { memoryStore, isDbConnected } = require('../config/db');

class PaymentService {
  /**
   * Process payment and update student fee status
   */
  static async recordPayment(paymentData) {
    const receiptNo = `REC-${Date.now().toString().slice(-6)}`;
    const transactionRef = paymentData.transactionRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPayment = {
      receiptNo,
      studentId: paymentData.studentId,
      studentName: paymentData.studentName,
      amount: paymentData.amount,
      paymentFor: paymentData.paymentFor || 'Hostel Fee',
      month: paymentData.month || 'Current Month',
      paymentDate: new Date(),
      paymentMethod: paymentData.paymentMethod || 'UPI',
      transactionRef,
      status: 'Paid',
      notes: paymentData.notes || ''
    };

    if (isDbConnected()) {
      const created = await Payment.create(newPayment);
      
      // Update student feeStatus to Paid
      await Student.findOneAndUpdate(
        { studentId: paymentData.studentId },
        { feeStatus: 'Paid' }
      );
      return created;
    } else {
      const created = { _id: `pay-${Date.now()}`, ...newPayment };
      memoryStore.payments.unshift(created);

      const student = memoryStore.students.find(s => s.studentId === paymentData.studentId);
      if (student) student.feeStatus = 'Paid';

      return created;
    }
  }
}

module.exports = PaymentService;
