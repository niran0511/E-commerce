const Coupon = require('../models/Coupon');

/**
 * @desc    Apply a coupon code and calculate discount
 * @route   POST /api/coupons/apply
 * @access  Private
 */
const applyCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ success: false, message: 'This coupon is expired or no longer valid' });
    }

    if (subtotal !== undefined && subtotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₹${coupon.minPurchase} required for coupon ${coupon.code}`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.round(discount * 100) / 100;

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        maxDiscount: coupon.maxDiscount,
        minPurchase: coupon.minPurchase,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Validate a coupon without applying (checks minimum purchase too)
 * @route   POST /api/coupons/validate
 * @access  Private
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ success: false, message: 'This coupon is expired or no longer valid' });
    }

    // Check minimum purchase requirement
    if (subtotal !== undefined && subtotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₹${coupon.minPurchase} required for ${coupon.code}`,
      });
    }

    // Calculate discount for response
    let discount = 0;
    const amt = subtotal || 0;
    if (coupon.discountType === 'percentage') {
      discount = (amt * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.round(discount);

    res.status(200).json({
      success: true,
      message: 'Coupon is valid',
      data: {
        valid: true,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        validUntil: coupon.validUntil,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { applyCoupon, validateCoupon };
