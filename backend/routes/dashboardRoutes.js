const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/summary', protect, roleCheck('admin'), getDashboardSummary);

module.exports = router;
