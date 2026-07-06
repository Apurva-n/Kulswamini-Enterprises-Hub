const Order = require('../models/Order');

async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const lastOrder = await Order.findOne({ invoiceNumber: new RegExp(`^${prefix}`) })
    .sort({ invoiceNumber: -1 })
    .select('invoiceNumber')
    .lean();

  let seq = 1;
  if (lastOrder?.invoiceNumber) {
    const parts = lastOrder.invoiceNumber.split('-');
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${String(seq).padStart(5, '0')}`;
}

module.exports = { generateInvoiceNumber };
