const express = require('express');
const { listCategories, createCategory, updateCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', protect, listCategories);
router.post('/', protect, roleCheck('admin'), createCategory);
router.patch('/:id', protect, roleCheck('admin'), updateCategory);

module.exports = router;
