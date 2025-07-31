const router = require('express').Router();
const auth = require('../middleware/auth');
const bazarMessageCtrl = require('../controllers/bazarMessageCtrl');

router.post('/bazar-messages/start/:itemId', auth, bazarMessageCtrl.startOrGetConversation);

// Create a message (auto-creates conversation if needed)
router.post('/bazar-message', auth, bazarMessageCtrl.createMessage);

// Get paginated list of conversations for the logged-in user
router.get('/bazar-conversations', auth, bazarMessageCtrl.getConversations);

// Get paginated list of messages from a conversation
router.get('/bazar-message/:conversationId', auth, bazarMessageCtrl.getMessages);

// Delete a message (only sender can delete)
router.delete('/bazar-message/:id', auth, bazarMessageCtrl.deleteMessage);

// Delete a conversation and all its messages
router.delete('/bazar-conversation/:id', auth, bazarMessageCtrl.deleteConversation);

module.exports = router;