const express = require('express');
const { getPendingUsers, approveUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect, roleCheck('admin'));
router.get('/pending', getPendingUsers);
router.patch('/:id/approve', approveUser);

module.exports = router;
