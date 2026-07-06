require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { getEnv } = require('../config/env');
const { createOpeningBalanceEntry } = require('../services/ledgerService');

const categories = [
  { name: 'Engine Oil', type: 'oil' },
  { name: 'Gear Oil', type: 'oil' },
  { name: 'Coolant', type: 'oil' },
  { name: 'Filters', type: 'part' },
  { name: 'Brake Parts', type: 'part' },
];

async function seed() {
  const env = getEnv();
  await mongoose.connect(env.mongodbUri);
  console.log('Connected for seeding');

  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash(env.adminPassword, 10);
    await User.create({
      name: env.adminName,
      email: env.adminEmail,
      phone: '9999999999',
      passwordHash,
      role: 'admin',
      approvalStatus: 'approved',
    });
    console.log(`Admin created: ${env.adminEmail} / ${env.adminPassword}`);
  } else {
    console.log('Admin already exists, skipping');
  }

  for (const cat of categories) {
    await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
  }
  console.log('Categories seeded');

  const engineOil = await Category.findOne({ name: 'Engine Oil' });
  const filters = await Category.findOne({ name: 'Filters' });

  const sampleProducts = [
    {
      name: 'Castrol GTX 20W-40',
      categoryId: engineOil._id,
      brand: 'Castrol',
      unit: 'litre',
      pricePerUnit: 450,
      stockQuantity: 100,
      lowStockThreshold: 20,
    },
    {
      name: 'Mobil Super 10W-30',
      categoryId: engineOil._id,
      brand: 'Mobil',
      unit: 'litre',
      pricePerUnit: 520,
      stockQuantity: 80,
      lowStockThreshold: 15,
    },
    {
      name: 'Oil Filter - Maruti 800',
      categoryId: filters._id,
      brand: 'Bosch',
      unit: 'piece',
      pricePerUnit: 180,
      stockQuantity: 50,
      lowStockThreshold: 10,
    },
  ];

  for (const p of sampleProducts) {
    await Product.findOneAndUpdate({ name: p.name }, p, { upsert: true, new: true });
  }
  console.log('Sample products seeded');

  const demoShop = await Shop.findOne({ name: 'Demo Auto Store' });
  if (!demoShop) {
    const shop = await Shop.create({
      name: 'Demo Auto Store',
      ownerName: 'Ramesh Patil',
      phone: '9876543210',
      village: 'Wakad',
      taluka: 'Haveli',
      address: 'Main Road, Wakad',
      openingBalance: 5000,
    });
    await createOpeningBalanceEntry(shop._id, shop.openingBalance);
    console.log('Demo shop created with opening balance ₹5000');
  }

  console.log('Seed complete');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
