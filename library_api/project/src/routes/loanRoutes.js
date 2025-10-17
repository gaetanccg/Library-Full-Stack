const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  validateLoan,
  validateObjectId,
  validatePagination
} = require('../middlewares/validation');

router.post('/', authenticate, validateLoan, loanController.createLoan);
router.get('/my', authenticate, loanController.getMyLoans);
router.get('/history', authenticate, validatePagination, loanController.getLoanHistory);
router.patch('/:id/return', authenticate, validateObjectId, loanController.returnBook);
router.patch('/:id/renew', authenticate, validateObjectId, loanController.renewLoan);

router.get(
  '/overdue',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  loanController.getOverdueLoans
);

router.get(
  '/',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  validatePagination,
  loanController.getAllLoans
);

module.exports = router;
