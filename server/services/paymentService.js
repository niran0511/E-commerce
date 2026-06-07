const crypto = require('crypto');

/**
 * Simulated payment processing service.
 * In production, this would integrate with Razorpay, Stripe, etc.
 *
 * @param {string} method - Payment method: COD, Card, UPI
 * @param {number} amount - Amount in INR
 * @returns {Object} Payment result with status and transaction ID
 */
const processPayment = async (method, amount) => {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const transactionId = `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

  switch (method) {
    case 'COD':
      return {
        status: 'success',
        transactionId,
        method: 'COD',
        message: 'Cash on Delivery – payment will be collected at delivery',
        amount,
      };

    case 'Card':
      return {
        status: 'success',
        transactionId,
        method: 'Card',
        message: 'Card payment processed successfully (simulated)',
        amount,
      };

    case 'UPI':
      return {
        status: 'success',
        transactionId,
        method: 'UPI',
        message: 'UPI payment processed successfully (simulated)',
        amount,
      };

    default:
      return {
        status: 'failed',
        transactionId: null,
        method,
        message: `Unsupported payment method: ${method}`,
        amount,
      };
  }
};

module.exports = { processPayment };
