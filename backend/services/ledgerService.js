const LedgerEntry = require('../models/LedgerEntry');

async function getCurrentBalance(shopId, session = null) {
  const query = LedgerEntry.findOne({ shopId }).sort({ date: -1, createdAt: -1 }).select('balanceAfter');
  if (session) query.session(session);
  const latest = await query.lean();
  return latest?.balanceAfter ?? 0;
}

async function createLedgerEntry({ shopId, type, amount, note, relatedOrderId, relatedPaymentId, session }) {
  const currentBalance = await getCurrentBalance(shopId, session);
  const delta = type === 'debit' ? amount : -amount;
  const balanceAfter = currentBalance + delta;

  const entry = await LedgerEntry.create(
    [
      {
        shopId,
        type,
        amount,
        note,
        relatedOrderId: relatedOrderId || null,
        relatedPaymentId: relatedPaymentId || null,
        balanceAfter,
        date: new Date(),
      },
    ],
    { session }
  );

  return entry[0];
}

async function createOpeningBalanceEntry(shopId, openingBalance, session = null) {
  if (!openingBalance || openingBalance <= 0) return null;

  return createLedgerEntry({
    shopId,
    type: 'debit',
    amount: openingBalance,
    note: 'Opening balance (migration)',
    session,
  });
}

async function getLedgerForShop(shopId, { startDate, endDate } = {}) {
  const filter = { shopId };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const entries = await LedgerEntry.find(filter)
    .sort({ date: 1, createdAt: 1 })
    .populate('relatedOrderId', 'invoiceNumber totalAmount status')
    .populate('relatedPaymentId', 'method amount')
    .lean();

  const currentBalance = await getCurrentBalance(shopId);

  return { entries, currentBalance };
}

module.exports = {
  getCurrentBalance,
  createLedgerEntry,
  createOpeningBalanceEntry,
  getLedgerForShop,
};
