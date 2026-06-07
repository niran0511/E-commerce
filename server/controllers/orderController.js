const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const { processPayment } = require('../services/paymentService');
const twilio = require('twilio');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod = 'COD',
      couponCode,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in order',
      });
    }

    // Build order items and calculate subtotal
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product || item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product || item.productId}`,
        });
      }

      if (product.stock < (item.quantity || 1)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const qty = item.quantity || 1;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.images[0] || 'https://via.placeholder.com/100x100.png?text=Product',
      });

      subtotal += product.price * qty;
    }

    // Calculate tax (18% GST)
    const tax = Math.round(subtotal * 0.18 * 100) / 100;

    // Shipping: free above ₹500, else ₹50
    const shippingCharges = subtotal >= 500 ? 0 : 50;

    // Apply coupon discount
    let discount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid()) {
        if (subtotal >= coupon.minPurchase) {
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
          discount = Math.round(discount * 100) / 100;
          appliedCouponCode = coupon.code;

          // Increment usage
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const totalAmount = Math.round((subtotal + tax + shippingCharges - discount) * 100) / 100;

    // Process payment (simulated)
    const paymentResult = await processPayment(paymentMethod, totalAmount);

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentStatus: paymentResult.status === 'success' ? 'Paid' : 'Pending',
      orderStatus: 'Processing',
      subtotal,
      tax,
      shippingCharges,
      discount,
      couponCode: appliedCouponCode,
      totalAmount,
    });

    // Update product stock and sold count
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    const { sendSuccessMessage } = require('../services/messageService');
    if (paymentMethod === 'COD') {
      const email = req.user?.email;
      await sendSuccessMessage(order, email, shippingAddress.phone);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's orders
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments({ user: req.user._id });
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify ownership (unless admin)
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    // Cannot cancel if already Shipped, OutForDelivery, or Delivered
    const nonCancellable = ['Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'];
    if (nonCancellable.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`,
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'Cancelled by user';

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity },
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Return an order
 * @route   PUT /api/orders/:id/return
 * @access  Private
 */
const returnOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to return this order',
      });
    }

    // Can only return if Delivered
    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: `Cannot return order with status: ${order.orderStatus}. Only delivered orders can be returned.`,
      });
    }

    order.orderStatus = 'Return Requested';
    order.returnReason = req.body.reason || 'Returned by user';

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order return requested successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  returnOrder,
};
