const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

const listProducts = asyncHandler(async (req, res) => {
  const { categoryId, search, lowStock } = req.query;
  const filter = req.user.role === 'admin' ? {} : { isActive: true };

  if (categoryId) filter.categoryId = categoryId;
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') },
    ];
  }

  let products = await Product.find(filter).populate('categoryId', 'name type').sort({ name: 1 }).lean();

  if (lowStock === 'true') {
    products = products.filter((p) => p.stockQuantity <= p.lowStockThreshold);
  }

  res.json(products);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  const populated = await Product.findById(product._id).populate('categoryId', 'name type');
  res.status(201).json(populated);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const fields = [
    'name', 'categoryId', 'brand', 'unit', 'pricePerUnit',
    'stockQuantity', 'lowStockThreshold', 'imageUrl', 'isActive',
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });

  // Stock adjustment via stockAdjust delta
  if (req.body.stockAdjust !== undefined) {
    product.stockQuantity = Math.max(0, product.stockQuantity + parseInt(req.body.stockAdjust, 10));
  }

  await product.save();
  const populated = await Product.findById(product._id).populate('categoryId', 'name type');
  res.json(populated);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('categoryId', 'name type');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

module.exports = { listProducts, createProduct, updateProduct, getProduct };
