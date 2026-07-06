const Order = require('../models/Order');
const { createOrder, updateOrderStatus } = require('../services/orderService');
const { streamInvoice } = require('../services/invoiceService');
const asyncHandler = require('../utils/asyncHandler');

const listOrders = asyncHandler(async (req, res) => {
  const { status, shopId, search } = req.query;
  const filter = {};

  if (req.user.role === 'shopkeeper') {
    filter.shopId = req.user.shopId;
  } else if (shopId) {
    filter.shopId = shopId;
  }

  if (status) filter.status = status;

  let orders = await Order.find(filter)
    .populate('shopId', 'name village taluka')
    .populate('createdBy', 'name role')
    .populate('items.productId', 'name brand unit')
    .sort({ orderDate: -1 });

  if (search) {
    const re = new RegExp(search, 'i');
    orders = orders.filter(
      (o) => re.test(o.invoiceNumber) || re.test(o.shopId?.name || '')
    );
  }

  res.json(orders);
});

const placeOrder = asyncHandler(async (req, res) => {
  const { items, shopId: bodyShopId } = req.body;

  if (!items?.length) {
    res.status(400);
    throw new Error('Order must contain at least one item');
  }

  let shopId;
  if (req.user.role === 'admin') {
    if (!bodyShopId) {
      res.status(400);
      throw new Error('shopId is required for admin-created orders');
    }
    shopId = bodyShopId;
  } else {
    shopId = req.user.shopId;
    if (!shopId) {
      res.status(400);
      throw new Error('Shopkeeper is not linked to a shop');
    }
  }

  try {
    const order = await createOrder({ shopId, createdBy: req.user._id, items });
    res.status(201).json(order);
  } catch (err) {
    if (/not found or inactive/i.test(err.message)) {
      res.status(404);
    } else if (/quantity|duplicate|productId|at least one item/i.test(err.message)) {
      res.status(400);
    }
    throw err;
  }
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400);
    throw new Error('status is required');
  }

  const order = await updateOrderStatus(req.params.id, status);
  res.json(order);
});

const getOrderInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('shopId')
    .populate('items.productId', 'name brand unit');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (req.user.role === 'shopkeeper' && order.shopId._id.toString() !== req.user.shopId.toString()) {
    res.status(403);
    throw new Error('Forbidden');
  }

  streamInvoice(res, order, order.shopId);
});

module.exports = { listOrders, placeOrder, updateStatus, getOrderInvoice };
