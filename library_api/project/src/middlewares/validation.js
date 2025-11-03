const {
    body,
    param,
    query,
    validationResult
} = require('express-validator');

/* ===========
   🔹 Fonctions personnalisées (anciennes de validator.js)
   =========== */
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => (password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password));
const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
const validateAge = (age) => age >= 18 && age <= 120;

/* ===========
   🔹 Middleware pour gérer les erreurs de validation
   =========== */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map(err => err.msg);
        return res.status(400).json({
            success: false,
            message: messages.join(', '),
            errors: errors.array()
        });
    }
    next();
};

/* ===========
   🔹 Validations AUTH
   =========== */
const validateRegister = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('Le prénom est requis')
        .isLength({min: 2}).withMessage('Le prénom doit contenir au moins 2 caractères'),

    body('lastName')
        .trim()
        .notEmpty().withMessage('Le nom est requis')
        .isLength({min: 2}).withMessage('Le nom doit contenir au moins 2 caractères'),

    body('email')
        .trim()
        .notEmpty().withMessage('L\'email est requis')
        .custom(email => validateEmail(email)).withMessage('Adresse email invalide'),

    body('password')
        .notEmpty().withMessage('Le mot de passe est requis')
        .custom(password => validatePassword(password)).withMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.'),

    body('phone')
        .optional()
        .custom(phone => validatePhone(phone)).withMessage('Le numéro de téléphone doit contenir 10 chiffres.'),

    body('role')
        .optional()
        .isIn([
            'étudiant',
            'professeur',
            'bibliothécaire',
            'admin'
        ])
        .withMessage('Rôle invalide'),

    handleValidationErrors
];

const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('L\'email est requis')
        .custom(email => validateEmail(email)).withMessage('Adresse email invalide'),

    body('password')
        .notEmpty().withMessage('Le mot de passe est requis'),

    handleValidationErrors
];

/* ===========
   🔹 Autres validations (déjà existantes)
   =========== */
const validateBook = [
    body('isbn')
        .trim()
        .notEmpty().withMessage('L\'ISBN est requis'),

    body('title')
        .trim()
        .notEmpty().withMessage('Le titre est requis'),

    body('authors')
        .isArray({min: 1}).withMessage('Au moins un auteur est requis')
        .custom((authors) => {
            return authors.every(author => {
                if (/^[0-9a-fA-F]{24}$/.test(author)) return true;
                if (typeof author === 'string' && author.trim().length > 0) return true;
                if (typeof author === 'object' && author.firstName && author.lastName) return true;
                return false;
            });
        }).withMessage('ID ou nom d\'auteur invalide'),

    body('categories')
        .optional()
        .isArray().withMessage('Les catégories doivent être un tableau'),

    body('totalCopies')
        .optional()
        .isInt({min: 0}).withMessage('Le nombre d\'exemplaires doit être positif'),

    body('availableCopies')
        .optional()
        .isInt({min: 0}).withMessage('Le nombre d\'exemplaires disponibles doit être positif'),

    body('pages')
        .optional()
        .isInt({min: 1}).withMessage('Le nombre de pages doit être au moins 1'),

    body('summary')
        .optional()
        .isLength({max: 2000}).withMessage('Le résumé ne peut pas dépasser 2000 caractères'),

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
        .isInt({min: 1}).withMessage('La page doit être un nombre positif'),
    query('limit')
        .optional()
        .isInt({
            min: 1,
            max: 100
        }).withMessage('La limite doit être entre 1 et 100'),
    handleValidationErrors
];

const validateUserStatus = [
    body('status')
        .notEmpty().withMessage('Le statut est requis')
        .isIn([
            'actif',
            'suspendu',
            'supprimé'
        ]).withMessage('Statut invalide'),
    handleValidationErrors
];

const validatePayFine = [
    body('amount')
        .notEmpty().withMessage('Le montant est requis')
        .isFloat({min: 0.01}).withMessage('Le montant doit être positif'),
    handleValidationErrors
];

/* ===========
   🔹 Exports
   =========== */
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
