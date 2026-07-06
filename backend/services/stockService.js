const Product = require('../models/Product');

async function deductStock(items, session) {
  for (const item of items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.productId, stockQuantity: { $gte: item.quantity }, isActive: true },
      { $inc: { stockQuantity: -item.quantity } },
      { new: true, session }
    );

    if (!updated) {
      throw new Error(`Insufficient stock for product ${item.productId}`);
    }
  }
}

async function restoreStock(items, session) {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: item.quantity } }, { session });
  }
}

module.exports = { deductStock, restoreStock };
