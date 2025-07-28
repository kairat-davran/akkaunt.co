const mongoose = require('mongoose');

const bazarMessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Types.ObjectId,
    ref: 'bazarConversation',
    required: true
  },
  sender: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
  recipient: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
  text: String,
  media: Array,
  offerPrice: Number,
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('bazarMessage', bazarMessageSchema);