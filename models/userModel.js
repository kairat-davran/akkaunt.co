const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true, maxLength: 25 },
  username: { type: String, required: true, trim: true, maxLength: 25, unique: true },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: [/^\+\d{1,4}\d{6,14}$/, 'Invalid phone number format.']
  },
  password: { type: String, required: true },
  avatar: {
    type: String,
    default: '/images/profile-default.jpg'
  },
  role: { type: String, default: 'user' },
  gender: { type: String, default: 'male' },
  story: { type: String, default: '', maxLength: 200 },
  website: { type: String, default: '' },
  theme: { type: Boolean, default: false },

  // Seen posts in Discover feed
  // seenDiscoverPosts: [{ type: mongoose.Types.ObjectId, ref: 'post'}],
  seenDiscoverPosts: [{ postId: { type: mongoose.Types.ObjectId, ref: 'post', required: true },
    seenAt: { type: Date, default: Date.now } }],

  // Social
  followers: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
  following: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
  saved: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
  savedBazarItems: [{ type: mongoose.Types.ObjectId, ref: 'bazar' }],

  // 📦 Seller profile
  sellerProfile: {
    type: mongoose.Types.ObjectId,
    ref: 'sellerProfile'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('user', userSchema);