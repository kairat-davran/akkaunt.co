const mongoose = require('mongoose');

const bazarMessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Types.ObjectId, ref: 'bazarConversation' },
  sender: { type: mongoose.Types.ObjectId, ref: 'user' },
  recipient: { type: mongoose.Types.ObjectId, ref: 'user' },
  text: String,
  media: Array,
  offerPrice: Number,
}, {
  timestamps: true
});

module.exports = mongoose.model('bazarMessage', bazarMessageSchema);