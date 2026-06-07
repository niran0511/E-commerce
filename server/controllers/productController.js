const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * @desc    Get all products with filtering, search, sorting, pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Search by name (regex, case-insensitive)
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by category (supports category name or ObjectId)
    if (req.query.category) {
      const isObjectId = /^[a-f\d]{24}$/i.test(req.query.category);
      if (isObjectId) {
        filter.category = req.query.category;
      } else {
        const category = await Category.findOne({ name: { $regex: req.query.category, $options: 'i' } });
        if (category) {
          filter.category = category._id;
        } else {
          // Category not found — return empty result immediately
          return res.status(200).json({ success: true, data: { products: [], pagination: { page, limit, total: 0, pages: 0 } } });
        }
      }
    }

    // Filter by brand
    if (req.query.brand) {
      filter.brand = { $regex: req.query.brand, $options: 'i' };
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Filter by minimum rating
    if (req.query.rating) {
      filter.avgRating = { $gte: parseFloat(req.query.rating) };
    }

    // Determine sort order
    let sortOption = { createdAt: -1 }; // default: newest first
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price':
          sortOption = { price: 1 };
          break;
        case '-price':
          sortOption = { price: -1 };
          break;
        case '-createdAt':
          sortOption = { createdAt: -1 };
          break;
        case 'createdAt':
          sortOption = { createdAt: 1 };
          break;
        case '-sold':
          sortOption = { sold: -1 };
          break;
        case '-avgRating':
          sortOption = { avgRating: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        products,
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
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .populate('category', 'name slug')
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get new arrival products
 * @route   GET /api/products/new-arrivals
 * @access  Public
 */
const getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.find({ isNewArrival: true })
      .populate('category', 'name slug')
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get best-seller products
 * @route   GET /api/products/best-sellers
 * @access  Public
 */
const getBestSellers = async (req, res, next) => {
  try {
    const products = await Product.find({ isBestSeller: true })
      .populate('category', 'name slug')
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all categories
 * @route   GET /api/products/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Text search products
 * @route   GET /api/products/search
 * @access  Public
 */
const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const products = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .populate('category', 'name slug')
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      data: { products, total: products.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get related products (same category)
 * @route   GET /api/products/:id/related
 * @access  Public
 */
const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const products = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .populate('category', 'name slug')
      .limit(6)
      .lean();

    res.status(200).json({ success: true, data: { products } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getCategories,
  searchProducts,
  getRelatedProducts,
};
