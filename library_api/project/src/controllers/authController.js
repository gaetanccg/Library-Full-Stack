const User = require('../models/User');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} = require('../utils/jwt');

/**
 * ======================
 *  REGISTER USER
 * ======================
 */
exports.register = async(req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            role,
            phone,
            address
        } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Cet email est déjà utilisé.'
            });
        }

        // Créer l'utilisateur
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: role || 'étudiant',
            phone,
            address
        });

        // Générer les tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        // Préparer la réponse (sans mot de passe ni refreshToken)
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshToken;

        return res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: {
                user: userResponse,
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ======================
 *  LOGIN USER
 * ======================
 */
exports.login = async(req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({email}).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Vérifier le statut du compte
        if (user.status !== 'actif') {
            return res.status(403).json({
                success: false,
                message: 'Votre compte est suspendu ou supprimé'
            });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Générer les tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        // Nettoyer la réponse
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshToken;

        return res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            data: {
                user: userResponse,
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ======================
 *  REFRESH TOKEN
 * ======================
 */
exports.refreshToken = async(req, res, next) => {
    try {
        const {refreshToken} = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token manquant'
            });
        }

        const decoded = verifyRefreshToken(refreshToken);

        const user = await User.findById(decoded.id).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token invalide'
            });
        }

        // Générer de nouveaux tokens
        const newAccessToken = generateAccessToken(user._id, user.role);
        const newRefreshToken = generateRefreshToken(user._id);

        user.refreshToken = newRefreshToken;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Token régénéré avec succès',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ======================
 *  LOGOUT USER
 * ======================
 */
exports.logout = async(req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.refreshToken = undefined;
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        next(error);
    }
};
