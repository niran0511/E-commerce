const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    mrp: {
      type: Number,
      min: [0, 'MRP cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    images: {
      type: [String],
      default: ['https://via.placeholder.com/400x400.png?text=Product'],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'A product must have at least one image',
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    brand: {
      type: String,
      trim: true,
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    detailedSpecs: [
      {
        group: { type: String, required: true },
        attributes: [
          {
            key: { type: String, required: true },
            value: { type: String, required: true }
          }
        ]
      }
    ],
    highlights: {
      type: [String],
      default: []
    },
    warranty: {
      type: String,
      default: "12 Months domestic warranty"
    },
    variants: [
      {
        color: String,
        colorHex: String,
        imageIndex: Number, // Maps to the index of the main product images array
        memory: String, // e.g., '256 GB + 12 GB'
        price: Number, // Absolute price for this variant
        mrp: Number,
        stock: Number
      }
    ],
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isHero: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Text index for search, plus indexes on commonly queried fields
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ avgRating: -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
