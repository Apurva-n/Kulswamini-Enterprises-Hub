const roleCheck = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    return next(new Error('Forbidden: insufficient permissions'));
  }
  next();
};

const shopAccess = (req, res, next) => {
  const { shopId } = req.params;
  if (req.user.role === 'admin') return next();
  if (req.user.role === 'shopkeeper' && req.user.shopId?.toString() === shopId) {
    return next();
  }
  res.status(403);
  next(new Error('Forbidden: cannot access this shop data'));
};

module.exports = { roleCheck, shopAccess };
