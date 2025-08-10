const mongoose = require('mongoose');

const bazarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    display: { type: String, default: '' }
  },
  images: { type: Array, default: [] },
  category: { type: String, default: 'General' },
  seller: { type: mongoose.Types.ObjectId, ref: 'user', required: true }
}, {
  timestamps: true
});

bazarSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('bazar', bazarSchema);