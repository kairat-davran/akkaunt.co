const router = require('express').Router();
const bazarCtrl = require('../controllers/bazarCtrl');
const auth = require('../middleware/auth');

router.route('/bazar')
  .post(auth, bazarCtrl.createItem)
  .get(bazarCtrl.getItems);

router.route('/bazar/:id')
  .get(bazarCtrl.getItemById)
  .patch(auth, bazarCtrl.updateItem)
  .delete(auth, bazarCtrl.deleteItem);

router.get('/bazar/seller/:id', bazarCtrl.getItemsBySeller);

module.exports = router;