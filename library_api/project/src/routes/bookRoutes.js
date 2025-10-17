const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  validateBook,
  validateObjectId,
  validatePagination
} = require('../middlewares/validation');

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Liste paginée des livres
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de la page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de résultats par page
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filtrer uniquement les livres disponibles
 *     responses:
 *       200:
 *         description: Liste des livres récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     books:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalBooks:
 *                           type: integer
 */
router.get('/', validatePagination, bookController.getAllBooks);

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Recherche textuelle de livres
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche (titre ou résumé)
 *         example: JavaScript
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 */
router.get('/search', bookController.searchBooks);

/**
 * @swagger
 * /api/books/category/{category}:
 *   get:
 *     summary: Livres par catégorie
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Roman, Science, Informatique, Histoire, Philosophie, Art, Biographie, Poésie, Théâtre, Jeunesse, Bande Dessinée, Sciences Humaines, Droit, Économie, Autre]
 *         description: Catégorie de livres
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
 *         description: Liste des livres de la catégorie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/category/:category', validatePagination, bookController.getBooksByCategory);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Détails d'un livre
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du livre
 *     responses:
 *       200:
 *         description: Détails du livre
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', validateObjectId, bookController.getBookById);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Créer un nouveau livre
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isbn
 *               - title
 *               - totalCopies
 *               - availableCopies
 *             properties:
 *               isbn:
 *                 type: string
 *                 example: 978-2-1234-5680-3
 *               title:
 *                 type: string
 *                 example: JavaScript pour les nuls
 *               subtitle:
 *                 type: string
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Douglas Crockford, John Resig]
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Informatique]
 *               totalCopies:
 *                 type: number
 *                 example: 5
 *               availableCopies:
 *                 type: number
 *                 example: 5
 *               publisher:
 *                 type: string
 *                 example: Éditions Tech
 *               pages:
 *                 type: number
 *                 example: 350
 *               language:
 *                 type: string
 *                 example: Français
 *               summary:
 *                 type: string
 *     responses:
 *       201:
 *         description: Livre créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  validateBook,
  bookController.createBook
);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Modifier un livre (complet)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Livre modifié avec succès
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  '/:id',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  validateObjectId,
  validateBook,
  bookController.updateBook
);

/**
 * @swagger
 * /api/books/{id}:
 *   patch:
 *     summary: Modification partielle d'un livre
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               totalCopies:
 *                 type: number
 *               availableCopies:
 *                 type: number
 *     responses:
 *       200:
 *         description: Livre modifié avec succès
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.patch(
  '/:id',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  validateObjectId,
  bookController.partialUpdateBook
);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Supprimer un livre (soft delete)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Livre supprimé avec succès
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateObjectId,
  bookController.deleteBook
);

module.exports = router;
