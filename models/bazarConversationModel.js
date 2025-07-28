const mongoose = require('mongoose');

const bazarConversationSchema = new mongoose.Schema({
  item: {
    type: mongoose.Types.ObjectId,
    ref: 'bazar',
    required: true
  },
  participants: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
  lastMessage: {
    text: String,
    media: Array
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('bazarConversation', bazarConversationSchema);