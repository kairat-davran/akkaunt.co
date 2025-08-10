const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    display: {
      type: String,
      default: ''
    }
  },
  images: {
    type: Array,
    default: [],
  },
  category: {
    type: String,
    default: 'General'
  },
  organizer: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true,
  },
}, {
  timestamps: true
});

eventSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('event', eventSchema);