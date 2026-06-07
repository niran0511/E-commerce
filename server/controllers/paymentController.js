const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay — uses test keys if real keys not set
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

/**
 * @desc    Create a Razorpay payment order
 * @route   POST /api/payment/create-order
 * @access  Private
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    // Razorpay amount is in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${orderId || Date.now()}`,
      notes: { orderId: orderId || '' },
    };

    // If Razorpay keys are placeholders, return a mock order for demo
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder') {
      return res.status(200).json({
        success: true,
        data: {
          mock: true,
          id: `order_mock_${Date.now()}`,
          amount: options.amount,
          currency,
          receipt: options.receipt,
          key: 'rzp_test_placeholder',
        },
      });
    }

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payment/verify
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Skip verification for mock/demo payments
    if (razorpay_order_id?.startsWith('order_mock_')) {
      if (orderId) {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'Paid',
          paymentId: razorpay_payment_id || `mock_pay_${Date.now()}`,
          paidAt: new Date(),
        }, { new: true }).populate('user');
        
        if (updatedOrder && updatedOrder.user) {
          const { sendSuccessMessage } = require('../services/messageService');
          await sendSuccessMessage(updatedOrder, updatedOrder.user.email, updatedOrder.shippingAddress?.phone);
        }
      }
      return res.status(200).json({
        success: true,
        message: 'Demo payment verified successfully',
        data: { verified: true, mock: true },
      });
    }

    // Real signature verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Update order payment status
    if (orderId) {
      const updatedOrder = await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'Paid',
        paymentId: razorpay_payment_id,
        paidAt: new Date(),
      }, { new: true }).populate('user');

      if (updatedOrder && updatedOrder.user) {
        const { sendSuccessMessage } = require('../services/messageService');
        await sendSuccessMessage(updatedOrder, updatedOrder.user.email, updatedOrder.shippingAddress?.phone);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: { verified: true, paymentId: razorpay_payment_id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Razorpay config (public key for frontend)
 * @route   GET /api/payment/config
 * @access  Public
 */
const getPaymentConfig = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      currency: 'INR',
      name: 'ShopSmart AI',
      description: 'Secure Payment Gateway',
      enabled: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder'),
    },
  });
};

/**
 * @desc    Handle payment failure
 * @route   POST /api/payment/fail
 * @access  Private
 */
const paymentFailed = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (orderId) {
      const updatedOrder = await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'Failed'
      }, { new: true }).populate('user');

      if (updatedOrder && updatedOrder.user) {
        const { sendFailureMessage } = require('../services/messageService');
        await sendFailureMessage(updatedOrder, updatedOrder.user.email, updatedOrder.shippingAddress?.phone);
      }
    }
    res.status(200).json({ success: true, message: 'Payment failure logged' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentOrder, verifyPayment, getPaymentConfig, paymentFailed };
