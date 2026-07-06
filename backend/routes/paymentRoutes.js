const express = require('express');
const { recordPayment, listPayments, getPaymentReceipt } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { roleCheck, shopAccess } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect);
router.post('/', roleCheck('admin'), recordPayment);
router.get('/receipt/:id', getPaymentReceipt);
router.get('/:shopId', shopAccess, listPayments);

module.exports = router;
