const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'name price mrp discount images stock brand'
    );

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity }],
      });
    } else {
      // Check if product already in cart
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        if (existingItem.quantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} items available in stock`,
          });
        }
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    // Populate and return
    cart = await Cart.findById(cart._id).populate(
      'items.product',
      'name price mrp discount images stock brand'
    );

    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    // Check stock
    const product = await Product.findById(item.product);
    if (product && quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    item.quantity = quantity;
    await cart.save();

    cart = await Cart.findById(cart._id).populate(
      'items.product',
      'name price mrp discount images stock brand'
    );

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    cart = await Cart.findById(cart._id).populate(
      'items.product',
      'name price mrp discount images stock brand'
    );

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle save for later on a cart item
 * @route   PUT /api/cart/:itemId/save-for-later
 * @access  Private
 */
const toggleSaveForLater = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    item.savedForLater = !item.savedForLater;
    await cart.save();

    cart = await Cart.findById(cart._id).populate(
      'items.product',
      'name price mrp discount images stock brand'
    );

    res.status(200).json({
      success: true,
      message: item.savedForLater ? 'Item saved for later' : 'Item moved to cart',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  toggleSaveForLater,
  clearCart,
};
