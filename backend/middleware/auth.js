const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getEnv } = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, getEnv().jwtSecret);
  const user = await User.findById(decoded.id).select('-passwordHash');

  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('Not authorized');
  }

  req.user = user;
  next();
});

module.exports = { protect };
