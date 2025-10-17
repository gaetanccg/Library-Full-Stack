const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  validateObjectId,
  validatePagination,
  validateUserStatus,
  validatePayFine
} = require('../middlewares/validation');

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.post('/pay-fine', authenticate, validatePayFine, userController.payFine);

router.get(
  '/',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  validatePagination,
  userController.getAllUsers
);

router.get(
  '/:id',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  validateObjectId,
  userController.getUserById
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  validateObjectId,
  validateUserStatus,
  userController.updateUserStatus
);

module.exports = router;
