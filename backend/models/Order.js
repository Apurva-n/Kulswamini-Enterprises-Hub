const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerUnit: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true, validate: [(v) => v.length > 0, 'Order must have items'] },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
    },
    invoiceNumber: { type: String, unique: true, sparse: true },
    orderDate: { type: Date, default: Date.now },
    deliveredDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
