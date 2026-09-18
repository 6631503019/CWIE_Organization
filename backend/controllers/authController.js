const User = require('../models/User');
const firebaseAdmin = require('../config/firebase');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { CustomError, createNotFoundError, ERROR_CODES } = require('../utils/customError');

// @desc    Login with a verified Google Workspace account
// @route   POST /api/auth/google
// @access  Public
const loginWithGoogle = async (req, res, next) => {
    try {
        const { idToken, loginType } = req.body;

        if (!idToken || !['admin', 'student'].includes(loginType)) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
                'Google token and login type are required'
            );
        }

        const decodedToken = await firebaseAdmin.verifyIdToken(idToken);
        const email = decodedToken.email?.toLowerCase();
        const allowedDomains = (process.env.GOOGLE_WORKSPACE_DOMAINS || process.env.GOOGLE_WORKSPACE_DOMAIN || 'mfu.ac.th,lamduan.mfu.ac.th')
            .split(',')
            .map(domain => domain.trim().toLowerCase().replace(/^@/, ''))
            .filter(Boolean);
        const adminEmail = (process.env.ADMIN_GOOGLE_EMAIL || '6631503019@lamduan.mfu.ac.th').trim().toLowerCase();
        const emailDomain = email?.split('@').pop();

        const isAdminEmail = email === adminEmail;
        const isAllowedDomain = emailDomain && allowedDomains.includes(emailDomain);

        if (!decodedToken.email_verified || !email || (!isAdminEmail && !isAllowedDomain)) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_EMAIL_DOMAIN_NOT_ALLOWED,
                `Only the registered Admin email or university accounts are allowed`
            );
        }

        let user = await User.findOne({ $or: [{ firebaseUid: decodedToken.uid }, { email }] });

        if (user && !user.isActive) {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_ACCOUNT_INACTIVE,
                'Account is disabled'
            );
        }

        if (loginType === 'admin' && !isAdminEmail) {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_INSUFFICIENT_PERMISSIONS,
                'Only the registered Admin Lamduan Mail can use Admin login'
            );
        }

        if (loginType === 'student' && user?.role === 'admin') {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_INSUFFICIENT_PERMISSIONS,
                'Administrator accounts must use the admin login'
            );
        }

        if (!user) {
            user = await User.create({
                firebaseUid: decodedToken.uid,
                email,
                name: decodedToken.name || email.split('@')[0],
                role: isAdminEmail ? 'admin' : 'user'
            });
        } else if (isAdminEmail && user.role !== 'admin') {
            user.role = 'admin';
            user.firebaseUid = decodedToken.uid;
            await user.save();
        } else if (user.firebaseUid !== decodedToken.uid) {
            user.firebaseUid = decodedToken.uid;
            await user.save();
        }

        const token = generateToken({ id: user._id });
        const refreshToken = generateRefreshToken({ id: user._id });

        res.status(200).json({
            success: true,
            message: 'Google login successful',
            token,
            refreshToken,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if (error.code?.startsWith('auth/')) {
            return next(new CustomError(
                ERROR_CODES.AUTH_TOKEN_INVALID,
                'Invalid Google authentication token'
            ));
        }
        next(error);
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new CustomError(
                ERROR_CODES.AUTH_TOKEN_MISSING,
                'Refresh token is required'
            );
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Get user
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new CustomError(
                ERROR_CODES.AUTH_USER_NOT_FOUND,
                'User not found'
            );
        }

        if (!user.isActive) {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_ACCOUNT_INACTIVE,
                'User account is disabled'
            );
        }

        // Generate new access token
        const token = generateToken({ id: user._id });

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            token
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new CustomError(
                ERROR_CODES.AUTH_TOKEN_INVALID,
                'Invalid refresh token'
            ));
        }

        if (error.name === 'TokenExpiredError') {
            return next(new CustomError(
                ERROR_CODES.AUTH_TOKEN_EXPIRED,
                'Refresh token has expired. Please login again'
            ));
        }

        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            throw createNotFoundError('user', req.user.id);
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loginWithGoogle,
    refresh,
    getMe
};