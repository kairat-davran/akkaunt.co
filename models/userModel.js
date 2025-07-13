const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true, maxLength: 25, unique: true },
  username: { type: String, required: true, trim: true, maxLength: 25, unique: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true },
  avatar: {
    type: String,
    default: 'https://akaunt-media.s3.us-west-2.amazonaws.com/profile+default+photo.jpg'
  },
  role: { type: String, default: 'user' },
  gender: { type: String, default: 'male' },
  mobile: { type: String, default: '' },
  address: { type: String, default: '' },
  story: { type: String, default: '', maxLength: 200 },
  website: { type: String, default: '' },

  // Social
  followers: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
  following: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
  saved: [{ type: mongoose.Types.ObjectId, ref: 'user' }],

  // 📦 Seller profile
  seller: {
    isTrusted: { type: Boolean, default: false },
    sellerSince: { type: Date },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    lockedAt: { type: Date },
    lockedReason: { type: String, default: '' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('user', userSchema);