const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');

const listCategories = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { isActive: true };
  const categories = await Category.find(filter).sort({ name: 1 });
  res.json(categories);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, type, parentCategory } = req.body;
  const category = await Category.create({ name, type, parentCategory: parentCategory || null });
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  ['name', 'type', 'parentCategory', 'isActive'].forEach((f) => {
    if (req.body[f] !== undefined) category[f] = req.body[f];
  });

  await category.save();
  res.json(category);
});

module.exports = { listCategories, createCategory, updateCategory };
