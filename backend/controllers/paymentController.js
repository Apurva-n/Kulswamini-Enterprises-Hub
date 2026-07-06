const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Shop = require('../models/Shop');
const { createLedgerEntry, getLedgerForShop } = require('../services/ledgerService');
const { streamPaymentReceipt } = require('../services/invoiceService');
const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

const PAYMENT_METHODS = ['cash', 'upi', 'bank_transfer'];

function validatePaymentInput({ shopId, amount, method, date }) {
  if (!shopId) {
    throw new Error('shopId is required');
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error('amount must be greater than 0');
  }

  if (!PAYMENT_METHODS.includes(method)) {
    throw new Error('method must be one of cash, upi, bank_transfer');
  }

  let parsedDate = new Date();
  if (date !== undefined && date !== null && date !== '') {
    parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error('date must be a valid date');
    }
  }

  return { shopId, amount: parsedAmount, method, date: parsedDate };
}

const getLedger = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const data = await getLedgerForShop(req.params.shopId, { startDate, endDate });
  res.json(data);
});

const recordPayment = asyncHandler(async (req, res) => {
  let paymentInput;
  try {
    paymentInput = validatePaymentInput(req.body);
  } catch (err) {
    res.status(400);
    throw err;
  }

  const shop = await Shop.findOne({ _id: paymentInput.shopId, isActive: true });
  if (!shop) {
    res.status(404);
    throw new Error('Shop not found or inactive');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ledgerEntry = await createLedgerEntry({
      shopId: paymentInput.shopId,
      type: 'credit',
      amount: paymentInput.amount,
      note: req.body.note || 'Payment received',
      session,
    });

    const payment = await Payment.create(
      [
        {
          shopId: paymentInput.shopId,
          amount: paymentInput.amount,
          method: paymentInput.method,
          note: req.body.note || '',
          date: paymentInput.date,
          recordedBy: req.user._id,
          ledgerEntryId: ledgerEntry._id,
        },
      ],
      { session }
    );

    ledgerEntry.relatedPaymentId = payment[0]._id;
    await ledgerEntry.save({ session });

    await session.commitTransaction();

    const populated = await Payment.findById(payment[0]._id)
      .populate('shopId', 'name')
      .populate('recordedBy', 'name');

    notificationService.notifyPaymentRecorded(populated, shop).catch(() => {});

    res.status(201).json(populated);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

const listPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ shopId: req.params.shopId })
    .populate('recordedBy', 'name')
    .sort({ date: -1 });
  res.json(payments);
});

const getPaymentReceipt = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('shopId');
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  if (req.user.role === 'shopkeeper' && payment.shopId._id.toString() !== req.user.shopId.toString()) {
    res.status(403);
    throw new Error('Forbidden');
  }

  streamPaymentReceipt(res, payment, payment.shopId);
});

module.exports = { getLedger, recordPayment, listPayments, getPaymentReceipt, validatePaymentInput };
