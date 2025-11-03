const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: errors.array()
    });
  }
  next();
};

const validateRegister = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role')
    .optional()
    .isIn(['étudiant', 'professeur', 'bibliothécaire', 'admin'])
    .withMessage('Rôle invalide'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide'),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis'),
  handleValidationErrors
];

const validateBook = [
    body('isbn')
        .trim()
        .notEmpty().withMessage('L\'ISBN est requis'),
    body('title')
        .trim()
        .notEmpty().withMessage('Le titre est requis'),
    body('authors')
        .isArray({ min: 1 }).withMessage('Au moins un auteur est requis')
        .custom((authors) => {
            return authors.every(author => {
                // Si c'est un ID Mongo valide
                if (/^[0-9a-fA-F]{24}$/.test(author)) return true;

                // Si c'est une string non vide
                if (typeof author === 'string' && author.trim().length > 0) return true;

                // Si c'est un objet avec firstName / lastName
                if (typeof author === 'object' && author.firstName && author.lastName) return true;

                return false;
            });
        }).withMessage('ID ou nom d\'auteur invalide'),
    body('categories')
        .optional()
        .isArray().withMessage('Les catégories doivent être un tableau'),
    body('totalCopies')
        .optional()
        .isInt({ min: 0 }).withMessage('Le nombre d\'exemplaires doit être positif'),
    body('availableCopies')
        .optional()
        .isInt({ min: 0 }).withMessage('Le nombre d\'exemplaires disponibles doit être positif'),
    body('pages')
        .optional()
        .isInt({ min: 1 }).withMessage('Le nombre de pages doit être au moins 1'),
    body('summary')
        .optional()
        .isLength({ max: 2000 }).withMessage('Le résumé ne peut pas dépasser 2000 caractères'),
    handleValidationErrors
];

const validateLoan = [
  body('bookId')
    .notEmpty().withMessage('L\'ID du livre est requis')
    .isMongoId().withMessage('ID de livre invalide'),
  handleValidationErrors
];

const validateObjectId = [
  param('id')
    .isMongoId().withMessage('ID invalide'),
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La page doit être un nombre positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100'),
  handleValidationErrors
];

const validateUserStatus = [
  body('status')
    .notEmpty().withMessage('Le statut est requis')
    .isIn(['actif', 'suspendu', 'supprimé']).withMessage('Statut invalide'),
  handleValidationErrors
];

const validatePayFine = [
  body('amount')
    .notEmpty().withMessage('Le montant est requis')
    .isFloat({ min: 0.01 }).withMessage('Le montant doit être positif'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateBook,
  validateLoan,
  validateObjectId,
  validatePagination,
  validateUserStatus,
  validatePayFine,
  handleValidationErrors
};
