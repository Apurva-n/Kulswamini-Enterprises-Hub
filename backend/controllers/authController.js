const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Shop = require('../models/Shop');
const { getEnv } = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (id) => jwt.sign({ id }, getEnv().jwtSecret, { expiresIn: getEnv().jwtExpiresIn });

const register = asyncHandler(async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !email || !password) {
    res.status(400);
    throw new Error('All fields are required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    phone,
    email,
    passwordHash,
    role: 'shopkeeper',
    approvalStatus: 'pending',
  });

  res.status(201).json({
    message: 'Registration submitted. Awaiting admin approval.',
    user: { id: user._id, name: user.name, email: user.email, approvalStatus: user.approvalStatus },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.role === 'shopkeeper') {
    if (user.approvalStatus === 'pending') {
      res.status(403);
      throw new Error('Account pending admin approval');
    }
    if (user.approvalStatus === 'rejected') {
      res.status(403);
      throw new Error('Account registration was rejected');
    }
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Account is deactivated');
  }

  const token = signToken(user._id);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      shopId: user.shopId,
      approvalStatus: user.approvalStatus,
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  let shop = null;
  if (req.user.shopId) {
    shop = await Shop.findById(req.user.shopId).select('name village taluka phone');
  }
  res.json({ user: req.user, shop });
});

module.exports = { register, login, getMe };
