const mongoose = require('mongoose');

const sellerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true
  },
  isTrusted: { type: Boolean, default: false },
  sellerSince: { type: Date, default: Date.now },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  lockedAt: { type: Date },
  lockedReason: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('sellerProfile', sellerProfileSchema);