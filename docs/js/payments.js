/**
 * Payments & Financial Receipt Helper
 */
const PaymentModule = {
  async recordFeePayment(studentId, studentName, amount, month, paymentMethod) {
    const res = await window.API.post('/api/payments', {
      studentId,
      studentName,
      amount,
      month,
      paymentMethod,
      transactionRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`
    });

    if (res.success && window.Notifications) {
      window.Notifications.showToast(`Payment of ₹${amount} recorded for ${studentName}`, 'success');
    }
    return res;
  }
};

window.PaymentModule = PaymentModule;
