const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get(
  '/dashboard',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getDashboardStats
);

router.get(
  '/top-borrowed',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getTopBorrowedBooks
);

router.get(
  '/category',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getStatsByCategory
);

router.get(
  '/overdue-users',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getOverdueUsers
);

router.get(
  '/loan-evolution',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getLoanEvolution
);

router.get(
  '/average-duration',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getAverageLoanDuration
);

router.get(
  '/popular-authors',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getMostPopularAuthors
);

module.exports = router;
