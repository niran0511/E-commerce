const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getCategories,
  searchProducts,
  getRelatedProducts,
} = require('../controllers/productController');

// All product routes are public
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/categories', getCategories);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProductById);
router.get('/', getProducts);

module.exports = router;
