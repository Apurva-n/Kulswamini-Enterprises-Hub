const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, enum: ['cash', 'upi', 'bank_transfer'], required: true },
    date: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, default: '' },
    ledgerEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'LedgerEntry', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
