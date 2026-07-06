const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { generateInvoiceNumber } = require('../utils/generateInvoiceNumber');
const { deductStock } = require('./stockService');
const { createLedgerEntry } = require('./ledgerService');
const notificationService = require('./notificationService');

function validateRequestedItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  const seenProducts = new Set();

  return items.map((item) => {
    const productId = item.productId?.toString();
    const quantity = Number(item.quantity);

    if (!productId) {
      throw new Error('Each order item must include a productId');
    }

    if (seenProducts.has(productId)) {
      throw new Error(`Duplicate product in order: ${productId}`);
    }
    seenProducts.add(productId);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Quantity must be a positive whole number for product ${productId}`);
    }

    return { productId, quantity };
  });
}

async function buildOrderItems(items) {
  const requestedItems = validateRequestedItems(items);
  const built = [];
  let totalAmount = 0;

  for (const item of requestedItems) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      throw new Error(`Product not found or inactive: ${item.productId}`);
    }

    const pricePerUnit = product.pricePerUnit;
    const subtotal = pricePerUnit * item.quantity;
    totalAmount += subtotal;

    built.push({
      productId: product._id,
      quantity: item.quantity,
      pricePerUnit,
      subtotal,
    });
  }

  return { items: built, totalAmount };
}

async function createOrder({ shopId, createdBy, items }) {
  const shop = await Shop.findOne({ _id: shopId, isActive: true }).select('_id').lean();
  if (!shop) {
    throw new Error('Shop not found or inactive');
  }

  const { items: builtItems, totalAmount } = await buildOrderItems(items);
  const invoiceNumber = await generateInvoiceNumber();

  const order = await Order.create({
    shopId,
    createdBy,
    items: builtItems,
    totalAmount,
    status: 'pending',
    invoiceNumber,
    orderDate: new Date(),
  });

  return order.populate(['shopId', 'createdBy', 'items.productId']);
}

async function updateOrderStatus(orderId, newStatus) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error('Order not found');

    const currentStatus = order.status;
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['dispatched', 'cancelled'],
      dispatched: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
    }

    if (newStatus === 'confirmed' && currentStatus === 'pending') {
      await deductStock(order.items, session);
      await createLedgerEntry({
        shopId: order.shopId,
        type: 'debit',
        amount: order.totalAmount,
        note: `Order ${order.invoiceNumber}`,
        relatedOrderId: order._id,
        session,
      });
    }

    order.status = newStatus;
    if (newStatus === 'delivered') {
      order.deliveredDate = new Date();
    }
    await order.save({ session });

    await session.commitTransaction();

    const populated = await Order.findById(orderId)
      .populate('shopId')
      .populate('createdBy', 'name email')
      .populate('items.productId', 'name brand unit');

    notificationService.notifyOrderStatusChange(populated, populated.shopId, newStatus).catch(() => {});

    return populated;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = { validateRequestedItems, buildOrderItems, createOrder, updateOrderStatus };
