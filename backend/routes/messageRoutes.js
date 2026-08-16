const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

router.post('/send', authMiddleware, uploadMiddleware('image'), messageController.sendMessage);
router.get('/room/:roomId', authMiddleware, messageController.getMessagesByRoom);
router.delete('/:messageId', authMiddleware, messageController.deleteMessage);

module.exports = router;
