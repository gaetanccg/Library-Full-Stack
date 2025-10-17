const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  validateBook,
  validateObjectId,
  validatePagination
} = require('../middlewares/validation');

router.get('/', validatePagination, bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/category/:category', validatePagination, bookController.getBooksByCategory);
router.get('/:id', validateObjectId, bookController.getBookById);

router.post(
  '/',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  validateBook,
  bookController.createBook
);

router.put(
  '/:id',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  validateObjectId,
  validateBook,
  bookController.updateBook
);

router.patch(
  '/:id',
  authenticate,
  authorize('bibliothécaire', 'admin'),
  validateObjectId,
  bookController.partialUpdateBook
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateObjectId,
  bookController.deleteBook
);

module.exports = router;
