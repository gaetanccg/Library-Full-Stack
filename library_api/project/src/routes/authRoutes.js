const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const {
    validateRegister,
    validateLogin
} = require('../middlewares/validation');
const {authenticate} = require('../middlewares/auth');
const {authLimiter} = require('../middlewares/rateLimiter');

/**
 * ======================
 *  ROUTES D’AUTHENTIFICATION
 * ======================
 */

// Inscription
// - Validation du corps de requête (validateRegister)
// - Limitation du nombre de tentatives (authLimiter)
router.post('/register', authLimiter, validateRegister, authController.register);

// Connexion
// - Validation du corps de requête (validateLogin)
// - Protection contre le brute-force (authLimiter)
router.post('/login', authLimiter, validateLogin, authController.login);

// Rafraîchir le token d’accès
// - Permet d’obtenir un nouveau accessToken à partir du refreshToken
router.post('/refresh', authController.refreshToken);

// Déconnexion
// - Nécessite que l’utilisateur soit authentifié
router.post('/logout', authenticate, authController.logout);

module.exports = router;
