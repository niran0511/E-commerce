const express = require('express');
const router = express.Router();
const { applyCoupon, validateCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/auth');

// All coupon routes are protected
router.use(protect);

router.post('/apply', applyCoupon);
router.post('/validate', validateCoupon);

module.exports = router;
