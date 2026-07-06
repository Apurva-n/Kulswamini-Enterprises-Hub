const express = require('express');
const { listOrders, placeOrder, updateStatus, getOrderInvoice } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect);
router.get('/', listOrders);
router.post('/', placeOrder);
router.patch('/:id/status', roleCheck('admin'), updateStatus);
router.get('/:id/invoice', getOrderInvoice);

module.exports = router;
