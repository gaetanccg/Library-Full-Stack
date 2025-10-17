const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  validateLoan,
  validateObjectId,
  validatePagination
} = require('../middlewares/validation');

/**
 * @swagger
 * /api/loans:
 *   post:
 *     summary: Emprunter un livre
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: ID du livre à emprunter
 *     responses:
 *       201:
 *         description: Emprunt créé avec succès
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', authenticate, validateLoan, loanController.createLoan);

/**
 * @swagger
 * /api/loans/my:
 *   get:
 *     summary: Mes emprunts actifs
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des emprunts actifs de l'utilisateur
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/my', authenticate, loanController.getMyLoans);

/**
 * @swagger
 * /api/loans/history:
 *   get:
 *     summary: Mon historique d'emprunts
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Historique des emprunts
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/history', authenticate, validatePagination, loanController.getLoanHistory);

/**
 * @swagger
 * /api/loans/{id}/return:
 *   patch:
 *     summary: Retourner un livre
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'emprunt
 *     responses:
 *       200:
 *         description: Livre retourné avec succès
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/return', authenticate, validateObjectId, loanController.returnBook);

/**
 * @swagger
 * /api/loans/{id}/renew:
 *   patch:
 *     summary: Renouveler un emprunt
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'emprunt
 *     responses:
 *       200:
 *         description: Emprunt renouvelé avec succès
 *       400:
 *         description: Impossible de renouveler (max atteint ou en retard)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/renew', authenticate, validateObjectId, loanController.renewLoan);

/**
 * @swagger
 * /api/loans/overdue:
 *   get:
 *     summary: Liste des emprunts en retard
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des emprunts en retard
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/overdue',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  loanController.getOverdueLoans
);

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Liste de tous les emprunts
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste de tous les emprunts
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  validatePagination,
  loanController.getAllLoans
);

module.exports = router;
