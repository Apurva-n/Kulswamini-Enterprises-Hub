const Order = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { getCurrentBalance } = require('../services/ledgerService');
const asyncHandler = require('../utils/asyncHandler');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

  const [monthlyOrders, quarterlyOrders, monthlyPayments, shops, lowStockProducts, pendingUsers] =
    await Promise.all([
      Order.find({ status: { $in: ['confirmed', 'dispatched', 'delivered'] }, orderDate: { $gte: startOfMonth } }),
      Order.find({ status: { $in: ['confirmed', 'dispatched', 'delivered'] }, orderDate: { $gte: startOfQuarter } }),
      Payment.find({ date: { $gte: startOfMonth } }),
      Shop.find({ isActive: true }).lean(),
      Product.find({ isActive: true }).lean(),
      User.countDocuments({ role: 'shopkeeper', approvalStatus: 'pending' }),
    ]);

  const monthlySales = monthlyOrders.reduce((s, o) => s + o.totalAmount, 0);
  const quarterlySales = quarterlyOrders.reduce((s, o) => s + o.totalAmount, 0);
  const monthlyCollections = monthlyPayments.reduce((s, p) => s + p.amount, 0);

  const shopBalances = await Promise.all(
    shops.map(async (shop) => ({
      shopId: shop._id,
      name: shop.name,
      village: shop.village,
      taluka: shop.taluka,
      balance: await getCurrentBalance(shop._id),
    }))
  );

  const totalOutstanding = shopBalances.reduce((s, sh) => s + sh.balance, 0);
  const topShopsByDue = [...shopBalances].sort((a, b) => b.balance - a.balance).slice(0, 10);

  const lowStock = lowStockProducts
    .filter((p) => p.stockQuantity <= p.lowStockThreshold)
    .map((p) => ({
      id: p._id,
      name: p.name,
      brand: p.brand,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold,
    }));

  // Sales trend — last 6 months
  const salesTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const orders = await Order.find({
      status: { $in: ['confirmed', 'dispatched', 'delivered'] },
      orderDate: { $gte: d, $lte: end },
    });
    salesTrend.push({
      month: d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
      sales: orders.reduce((s, o) => s + o.totalAmount, 0),
    });
  }

  // Top selling products this month
  const productSales = {};
  for (const order of monthlyOrders) {
    for (const item of order.items) {
      const id = item.productId.toString();
      productSales[id] = (productSales[id] || 0) + item.quantity;
    }
  }

  const productIds = Object.keys(productSales);
  const products = await Product.find({ _id: { $in: productIds } }).select('name brand');
  const topProducts = products
    .map((p) => ({ name: p.name, brand: p.brand, quantitySold: productSales[p._id.toString()] }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 10);

  res.json({
    monthlySales,
    quarterlySales,
    monthlyCollections,
    totalOutstanding,
    topShopsByDue,
    lowStock,
    pendingApprovals: pendingUsers,
    salesTrend,
    topProducts,
  });
});

module.exports = { getDashboardSummary };
