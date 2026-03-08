const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const c = require('../controllers/notificationsController');

router.get('/', authMiddleware, c.getNotifications);
router.put('/:id/read', authMiddleware, c.markRead);
router.put('/read-all', authMiddleware, c.markAllRead);

module.exports = router;
