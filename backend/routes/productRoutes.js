const express = require('express');
const { listProducts, createProduct, updateProduct, getProduct } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', protect, listProducts);
router.get('/:id', protect, getProduct);
router.post('/', protect, roleCheck('admin'), createProduct);
router.patch('/:id', protect, roleCheck('admin'), updateProduct);

module.exports = router;
