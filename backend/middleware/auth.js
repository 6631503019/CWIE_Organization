const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { CustomError, createAuthError, ERROR_CODES } = require('../utils/customError');

const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw new CustomError(
                ERROR_CODES.AUTH_TOKEN_MISSING,
                'Access denied. No token provided'
            );
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new CustomError(
                ERROR_CODES.AUTH_USER_NOT_FOUND,
                'Token is valid but user not found'
            );
        }

        if (!user.isActive) {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_ACCOUNT_INACTIVE,
                'User account is disabled'
            );
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new CustomError(
                ERROR_CODES.AUTH_TOKEN_INVALID,
                'Invalid token'
            ));
        }

        if (error.name === 'TokenExpiredError') {
            return next(new CustomError(
                ERROR_CODES.AUTH_TOKEN_EXPIRED,
                'Token has expired'
            ));
        }

        next(error);
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new CustomError(
                ERROR_CODES.FORBIDDEN_INSUFFICIENT_PERMISSIONS,
                `Role ${req.user.role} is not authorized to access this resource`
            ));
        }
        next();
    };
};

// Optional auth middleware - tries to attach user but doesn't fail if token is missing
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            // No token - just continue without user
            return next();
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id);

        if (user && user.isActive) {
            req.user = user;
        }

        next();
    } catch (error) {
        // Silently ignore auth errors - allow unauthenticated access
        console.debug('Optional auth error (non-blocking):', error.message);
        next();
    }
};

module.exports = {
    protect,
    optionalAuth,
    authorize
};