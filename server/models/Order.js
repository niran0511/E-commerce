const mongoose = require('mongoose');
const crypto = require('crypto');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
    },
    price: {
      type: Number,
      required: [true, 'Item price is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: 1,
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/100x100.png?text=Product',
    },
  },
  { _id: false }
);

const addressFieldSchema = new mongoose.Schema(
  {
    street: { type: String, required: [true, 'Street is required'] },
    city: { type: String, required: [true, 'City is required'] },
    state: { type: String, required: [true, 'State is required'] },
    zipCode: { type: String, required: [true, 'Zip code is required'] },
    country: { type: String, required: [true, 'Country is required'], default: 'India' },
    phone: { type: String, required: [true, 'Phone is required'] },
  },
  { _id: false }
);

const trackingUpdateSchema = new mongoose.Schema(
  {
    status: String,
    location: String,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    items: [orderItemSchema],
    shippingAddress: addressFieldSchema,
    billingAddress: addressFieldSchema,
    paymentMethod: {
      type: String,
      enum: ['COD', 'Card', 'UPI'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Processing', 'Confirmed', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'],
      default: 'Processing',
    },
    trackingInfo: {
      carrier: String,
      trackingNumber: String,
      estimatedDelivery: Date,
      updates: [trackingUpdateSchema],
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
    },
    tax: {
      type: Number,
      required: [true, 'Tax is required'],
    },
    shippingCharges: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    couponCode: String,
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    returnReason: String,
  },
  { timestamps: true }
);

// Auto-generate orderNumber before saving a new order
orderSchema.pre('save', function (next) {
  if (this.isNew && !this.orderNumber) {
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
    this.orderNumber = `ORD-${randomPart}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
