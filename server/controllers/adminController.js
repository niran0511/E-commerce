const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');

// ─── Dashboard ──────────────────────────────────────────────────────────────────

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Admin
 */
const getDashboard = async (req, res, next) => {
  try {
    // Basic counts
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    // Total revenue (non-cancelled)
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRevenueResult = await Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);
    const todayRevenue = todayRevenueResult[0]?.total || 0;
    const todayOrders = todayRevenueResult[0]?.count || 0;

    // This week revenue
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekRevenueResult = await Order.aggregate([
      { $match: { createdAt: { $gte: weekStart }, orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);
    const weekRevenue = weekRevenueResult[0]?.total || 0;

    // Recent 8 orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    // Monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Daily revenue last 7 days
    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: weekStart }, orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Order status distribution
    const orderStatusDistribution = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Top 5 selling products
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // Category-wise sales
    const categorySales = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryInfo._id',
          name: { $first: { $ifNull: ['$categoryInfo.name', 'Unknown'] } },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 6 },
    ]);

    // Low stock products (stock < 10)
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select('name stock images price')
      .sort({ stock: 1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        todayRevenue,
        todayOrders,
        weekRevenue,
        recentOrders,
        monthlyRevenue,
        dailyRevenue,
        orderStatusDistribution,
        topProducts,
        categorySales,
        lowStockProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Product Management ─────────────────────────────────────────────────────────

/**
 * @desc    Add a new product
 * @route   POST /api/admin/products
 * @access  Admin
 */
const addProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/admin/products/:id
 * @access  Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/admin/products/:id
 * @access  Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Also remove all reviews for this product
    await Review.deleteMany({ product: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Order Management ───────────────────────────────────────────────────────────

/**
 * @desc    Get all orders (admin)
 * @route   GET /api/admin/orders
 * @access  Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/admin/orders/:id/status
 * @access  Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, carrier, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Block admin from cancelling orders — only users can cancel
    if (status === 'Cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot cancel orders. Only customers can cancel their own orders.',
      });
    }

    // Guardrail: Do not allow modifying status of Delivered orders (unless marking as Returned)
    if (order.orderStatus === 'Delivered' && status !== 'Returned') {
      return res.status(403).json({
        success: false,
        message: 'Order is already Delivered. You cannot modify the status of a delivered order (except to Returned).',
      });
    }
    
    // Guardrail: Do not allow modifying Returned orders
    if (order.orderStatus === 'Returned') {
      return res.status(403).json({
        success: false,
        message: 'Order is already Returned. Status cannot be modified further.',
      });
    }

    order.orderStatus = status;

    // Add tracking info if provided
    if (carrier || trackingNumber || estimatedDelivery) {
      if (!order.trackingInfo) {
        order.trackingInfo = { updates: [] };
      }
      if (carrier) order.trackingInfo.carrier = carrier;
      if (trackingNumber) order.trackingInfo.trackingNumber = trackingNumber;
      if (estimatedDelivery) order.trackingInfo.estimatedDelivery = estimatedDelivery;

      order.trackingInfo.updates.push({
        status,
        location: req.body.location || '',
        timestamp: new Date(),
      });
    }

    // Set deliveredAt if delivered
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'Paid';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// ─── User Management ────────────────────────────────────────────────────────────

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Block / unblock a user
 * @route   PUT /api/admin/users/:id/block
 * @access  Admin
 */
const blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: user.isBlocked ? 'User blocked' : 'User unblocked',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Review Management ──────────────────────────────────────────────────────────

/**
 * @desc    Get all reviews
 * @route   GET /api/admin/reviews
 * @access  Admin
 */
const getAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Review.countDocuments();
    const reviews = await Review.find()
      .populate('user', 'name email avatar')
      .populate('product', 'name images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete any review (admin)
 * @route   DELETE /api/admin/reviews/:id
 * @access  Admin
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Coupon Management ──────────────────────────────────────────────────────────

/**
 * @desc    Get all coupons
 * @route   GET /api/admin/coupons
 * @access  Admin
 */
const getAllCoupons = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Coupon.countDocuments();
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        coupons,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a coupon
 * @route   POST /api/admin/coupons
 * @access  Admin
 */
const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a coupon
 * @route   PUT /api/admin/coupons/:id
 * @access  Admin
 */
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a coupon
 * @route   DELETE /api/admin/coupons/:id
 * @access  Admin
 */
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Category Management ────────────────────────────────────────────────────────

/**
 * @desc    Add a category
 * @route   POST /api/admin/categories
 * @access  Admin
 */
const addCategory = async (req, res, next) => {
  try {
    const { name, description, image, parent, isActive } = req.body;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parent: parent || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a category
 * @route   PUT /api/admin/categories/:id
 * @access  Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    // Auto-generate slug if name is updated
    if (req.body.name && !req.body.slug) {
      req.body.slug = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/admin/categories/:id
 * @access  Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    // Check if any products are using this category
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category – ${productCount} product(s) are using it. Reassign them first.`,
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  blockUser,
  deleteUser,
  getAllReviews,
  deleteReview,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  addCategory,
  updateCategory,
  deleteCategory,
};
