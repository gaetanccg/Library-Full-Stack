const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
    windowMs: 15 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Trop de requêtes, veuillez réessayer dans 15 secondes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 secondes'
    },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false
});

const apiLimiter = rateLimit({
    windowMs: 15 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Limite de requêtes API dépassée, veuillez réessayer dans 15 secondes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    generalLimiter,
    authLimiter,
    apiLimiter
};
