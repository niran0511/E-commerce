const express = require('express');
const router = express.Router();
const {
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
  setHeroProducts,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const {
  productValidation,
  couponValidation,
  validate,
} = require('../middleware/validate');

// All admin routes require authentication + admin role
router.use(protect, admin);

// Hero setup
router.put('/hero', setHeroProducts);

// Dashboard
router.get('/dashboard', getDashboard);

// Product management
router.post('/products', productValidation, validate, addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Order management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/block', blockUser);
router.delete('/users/:id', deleteUser);

// Review management
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// Coupon management
router.get('/coupons', getAllCoupons);
router.post('/coupons', couponValidation, validate, createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Category management
router.post('/categories', addCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
