const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate, authorize } = require('../middlewares/auth');

/**
 * @swagger
 * /api/stats/dashboard:
 *   get:
 *     summary: Statistiques générales du tableau de bord
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques générales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBooks:
 *                       type: integer
 *                     totalUsers:
 *                       type: integer
 *                     activeLoans:
 *                       type: integer
 *                     overdueLoans:
 *                       type: integer
 *                     totalFinesCollected:
 *                       type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/dashboard',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getDashboardStats
);

/**
 * @swagger
 * /api/stats/top-borrowed:
 *   get:
 *     summary: Top des livres les plus empruntés
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de résultats
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Période en jours
 *     responses:
 *       200:
 *         description: Top des livres empruntés
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/top-borrowed',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getTopBorrowedBooks
);

/**
 * @swagger
 * /api/stats/category:
 *   get:
 *     summary: Statistiques par catégorie de livres
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques par catégorie
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/category',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getStatsByCategory
);

/**
 * @swagger
 * /api/stats/overdue-users:
 *   get:
 *     summary: Utilisateurs avec des emprunts en retard
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs en retard
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/overdue-users',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getOverdueUsers
);

/**
 * @swagger
 * /api/stats/loan-evolution:
 *   get:
 *     summary: Évolution des emprunts dans le temps
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Nombre de mois à afficher
 *     responses:
 *       200:
 *         description: Évolution des emprunts
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/loan-evolution',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getLoanEvolution
);

/**
 * @swagger
 * /api/stats/average-duration:
 *   get:
 *     summary: Durée moyenne d'emprunt par catégorie
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Durées moyennes par catégorie
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/average-duration',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getAverageLoanDuration
);

/**
 * @swagger
 * /api/stats/popular-authors:
 *   get:
 *     summary: Auteurs les plus populaires
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des auteurs populaires
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/popular-authors',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  statsController.getMostPopularAuthors
);

module.exports = router;
