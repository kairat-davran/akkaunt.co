const router = require('express').Router();
const bazarCtrl = require('../controllers/bazarCtrl');
const auth = require('../middleware/auth');

// 🔁 Always put specific routes before dynamic ones
router.get('/bazar/saved', auth, bazarCtrl.getSavedItems);
router.get('/bazar/seller/:id', bazarCtrl.getItemsBySeller);
router.patch('/bazar/save/:id', auth, bazarCtrl.saveItem);
router.patch('/bazar/unsave/:id', auth, bazarCtrl.unsaveItem);

router.route('/bazar')
  .post(auth, bazarCtrl.createItem)
  .get(bazarCtrl.getItems);

// This must be last
router.route('/bazar/:id')
  .get(bazarCtrl.getItemById)
  .patch(auth, bazarCtrl.updateItem)
  .delete(auth, bazarCtrl.deleteItem);

module.exports = router;