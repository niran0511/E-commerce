const express = require('express');
const router = express.Router();
const { createPaymentOrder, verifyPayment, getPaymentConfig, paymentFailed } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/config', getPaymentConfig);
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/fail', protect, paymentFailed);

module.exports = router;
