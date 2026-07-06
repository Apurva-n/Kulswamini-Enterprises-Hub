const express = require('express');
const { getLedger } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { shopAccess } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/:shopId', protect, shopAccess, getLedger);

module.exports = router;
