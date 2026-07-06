const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'shopkeeper'], required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: function () {
        return this.role === 'shopkeeper' ? 'pending' : 'approved';
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
