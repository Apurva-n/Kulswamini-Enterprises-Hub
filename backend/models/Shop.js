const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    village: { type: String, required: true, trim: true },
    taluka: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    openingBalance: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shop', shopSchema);
