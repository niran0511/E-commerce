const express = require('express');
const router = express.Router();
const {
  addReview,
  updateReview,
  deleteReview,
  getProductReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { reviewValidation, validate } = require('../middleware/validate');

// Public: get reviews for a product
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, reviewValidation, validate, addReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
