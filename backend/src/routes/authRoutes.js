const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public routes
router.post('/login', authController.login);
router.get('/demo-accounts', authController.getDemoAccounts);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post(
  '/signature',
  authenticate,
  upload.single('signature'),
  authController.updateProfileSignature
);

module.exports = router;
