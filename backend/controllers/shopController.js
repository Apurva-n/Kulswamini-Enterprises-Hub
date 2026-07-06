const mongoose = require('mongoose');
const Shop = require('../models/Shop');
const { createOpeningBalanceEntry, getCurrentBalance } = require('../services/ledgerService');
const asyncHandler = require('../utils/asyncHandler');

const listShops = asyncHandler(async (req, res) => {
  const { taluka, village, active, search } = req.query;
  const filter = {};

  if (taluka) filter.taluka = new RegExp(taluka, 'i');
  if (village) filter.village = new RegExp(village, 'i');
  if (active !== undefined) filter.isActive = active === 'true';
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { ownerName: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];
  }

  const shops = await Shop.find(filter).sort({ createdAt: -1 }).lean();

  const withBalance = await Promise.all(
    shops.map(async (shop) => ({
      ...shop,
      currentBalance: await getCurrentBalance(shop._id),
    }))
  );

  if (req.query.minDue || req.query.maxDue) {
    const minDue = parseFloat(req.query.minDue) || 0;
    const maxDue = parseFloat(req.query.maxDue) || Infinity;
    return res.json(withBalance.filter((s) => s.currentBalance >= minDue && s.currentBalance <= maxDue));
  }

  res.json(withBalance);
});

const createShop = asyncHandler(async (req, res) => {
  const { name, ownerName, phone, village, taluka, address, gstNumber, openingBalance } = req.body;
  const parsedOpeningBalance = Number(openingBalance || 0);

  if (!Number.isFinite(parsedOpeningBalance) || parsedOpeningBalance < 0) {
    res.status(400);
    throw new Error('openingBalance must be 0 or greater');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const created = await Shop.create(
      [
        {
          name,
          ownerName,
          phone,
          village,
          taluka,
          address: address || '',
          gstNumber: gstNumber || '',
          openingBalance: parsedOpeningBalance,
        },
      ],
      { session }
    );

    const shop = created[0];

    if (shop.openingBalance > 0) {
      await createOpeningBalanceEntry(shop._id, shop.openingBalance, session);
    }

    await session.commitTransaction();

    const currentBalance = await getCurrentBalance(shop._id);
    res.status(201).json({ ...shop.toObject(), currentBalance });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

const updateShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) {
    res.status(404);
    throw new Error('Shop not found');
  }

  const fields = ['name', 'ownerName', 'phone', 'village', 'taluka', 'address', 'gstNumber', 'isActive'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) shop[f] = req.body[f];
  });

  await shop.save();
  const currentBalance = await getCurrentBalance(shop._id);
  res.json({ ...shop.toObject(), currentBalance });
});

const getShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id).lean();
  if (!shop) {
    res.status(404);
    throw new Error('Shop not found');
  }
  shop.currentBalance = await getCurrentBalance(shop._id);
  res.json(shop);
});

module.exports = { listShops, createShop, updateShop, getShop };
