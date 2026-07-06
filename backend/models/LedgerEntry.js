const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    type: { type: String, enum: ['debit', 'credit'], required: true },
    amount: { type: Number, required: true, min: 0 },
    relatedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    relatedPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now, index: true },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
