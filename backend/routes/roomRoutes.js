const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

router.post('/create', authMiddleware, uploadMiddleware('image'), roomController.createRoom);
router.get('/all', authMiddleware, roomController.getAllRooms);
router.get('/:roomId', authMiddleware, roomController.getRoom);
router.post('/:roomId/join', authMiddleware, roomController.joinRoom);
router.delete('/:roomId', authMiddleware, roomController.deleteRoom);

module.exports = router;
