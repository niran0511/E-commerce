const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  toggleSaveForLater,
  clearCart,
} = require('../controllers/cartController');
const { protect, userOnly } = require('../middleware/auth');

// All cart routes — protected & customers only (admins manage via admin panel)
router.use(protect, userOnly);

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/', clearCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeCartItem);
router.put('/:itemId/save-for-later', toggleSaveForLater);

module.exports = router;
