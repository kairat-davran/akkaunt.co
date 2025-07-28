const router = require('express').Router();
const auth = require('../middleware/auth');
const bazarMessageCtrl = require('../controllers/bazarMessageCtrl');

router.get('/bazar-messages/conversations', auth, bazarMessageCtrl.getBazarConversations);
router.get('/bazar-messages/:conversationId', auth, bazarMessageCtrl.getMessages);

router.post('/bazar-messages/start/:itemId', auth, bazarMessageCtrl.startOrGetConversation);
router.post('/bazar-messages/send/:conversationId', auth, bazarMessageCtrl.sendMessage);

router.delete('/bazar-messages/message/:id', auth, bazarMessageCtrl.deleteMessage);
router.delete('/bazar-messages/conversation/:id', auth, bazarMessageCtrl.deleteConversation);

module.exports = router;