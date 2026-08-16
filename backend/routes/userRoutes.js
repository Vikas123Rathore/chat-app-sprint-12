const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

router.get('/me', authMiddleware, userController.getCurrentUser);
router.get('/all', authMiddleware, userController.getAllUsers);
router.put('/update-profile', authMiddleware, uploadMiddleware('image'), userController.updateProfile);

module.exports = router;
