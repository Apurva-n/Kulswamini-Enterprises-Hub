const express = require('express');
const { listShops, createShop, updateShop, getShop } = require('../controllers/shopController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect, roleCheck('admin'));
router.get('/', listShops);
router.post('/', createShop);
router.get('/:id', getShop);
router.patch('/:id', updateShop);

module.exports = router;
