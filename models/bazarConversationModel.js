const mongoose = require('mongoose');

const bazarConversationSchema = new mongoose.Schema({
  recipients: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
  text: String,
  media: Array,
  item: { type: mongoose.Types.ObjectId, ref: 'bazar',},
}, {
  timestamps: true
});

module.exports = mongoose.model('bazarConversation', bazarConversationSchema);