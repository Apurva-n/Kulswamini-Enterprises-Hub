const User = require('../models/User');
const Shop = require('../models/Shop');
const asyncHandler = require('../utils/asyncHandler');

const getPendingUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'shopkeeper', approvalStatus: 'pending' })
    .select('-passwordHash')
    .sort({ createdAt: -1 });
  res.json(users);
});

const approveUser = asyncHandler(async (req, res) => {
  const { shopId, action } = req.body;
  const user = await User.findById(req.params.id);

  if (!user || user.role !== 'shopkeeper') {
    res.status(404);
    throw new Error('Shopkeeper not found');
  }

  if (action === 'reject') {
    user.approvalStatus = 'rejected';
    await user.save();
    return res.json({ message: 'User rejected', user });
  }

  if (!shopId) {
    res.status(400);
    throw new Error('shopId is required to approve a shopkeeper');
  }

  const shop = await Shop.findById(shopId);
  if (!shop || !shop.isActive) {
    res.status(400);
    throw new Error('Valid active shop is required');
  }

  user.approvalStatus = 'approved';
  user.shopId = shopId;
  await user.save();

  const populated = await User.findById(user._id).select('-passwordHash').populate('shopId', 'name village taluka');
  res.json({ message: 'User approved', user: populated });
});

module.exports = { getPendingUsers, approveUser };
