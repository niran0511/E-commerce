const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  returnOrder,
} = require('../controllers/orderController');
const { protect, userOnly } = require('../middleware/auth');
const { orderValidation, validate } = require('../middleware/validate');

// All order routes require authentication
router.use(protect);

router.post('/', userOnly, orderValidation, validate, createOrder); // customers only
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', userOnly, cancelOrder); // customers only
router.put('/:id/return', userOnly, returnOrder); // customers only

module.exports = router;
