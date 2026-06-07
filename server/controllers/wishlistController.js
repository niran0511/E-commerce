const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');

/**
 * @desc    Get current user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      'products.product',
      'name price mrp discount images stock brand avgRating'
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.status(200).json({
      success: true,
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [{ product: productId }],
      });
    } else {
      // Check if already in wishlist
      const exists = wishlist.products.some(
        (p) => p.product.toString() === productId
      );

      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Product already in wishlist',
        });
      }

      wishlist.products.push({ product: productId });
      await wishlist.save();
    }

    wishlist = await Wishlist.findById(wishlist._id).populate(
      'products.product',
      'name price mrp discount images stock brand avgRating'
    );

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.product.toString() !== productId
    );
    await wishlist.save();

    wishlist = await Wishlist.findById(wishlist._id).populate(
      'products.product',
      'name price mrp discount images stock brand avgRating'
    );

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Move product from wishlist to cart
 * @route   POST /api/wishlist/:productId/move-to-cart
 * @access  Private
 */
const moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Remove from wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    const productExists = wishlist.products.some(
      (p) => p.product.toString() === productId
    );
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist',
      });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.product.toString() !== productId
    );
    await wishlist.save();

    // Add to cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity: 1 }],
      });
    } else {
      const existingCartItem = cart.items.find(
        (item) => item.product.toString() === productId
      );
      if (existingCartItem) {
        existingCartItem.quantity += 1;
      } else {
        cart.items.push({ product: productId, quantity: 1 });
      }
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Product moved to cart',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
};
