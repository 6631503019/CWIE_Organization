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

        const str_Id_Token =
            typeof idToken === 'string' ? idToken.trim() : '';

        if (
            !str_Id_Token ||
            !['admin', 'student'].includes(loginType)
        ) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
                'Google token and login type are required'
            );
        }

        const decodedToken = await firebaseAdmin.verifyIdToken(str_Id_Token);

        const email = decodedToken.email?.trim().toLowerCase();

        const SPECIAL_ADMIN_EMAIL = '6631503019@lamduan.mfu.ac.th';

        const isSpecialAccount = email === SPECIAL_ADMIN_EMAIL;
        const isAdminDomain =
            email?.endsWith('@mfu.ac.th') &&
            !email?.endsWith('@lamduan.mfu.ac.th');
        const isStudentDomain = email?.endsWith('@lamduan.mfu.ac.th');

        if (!decodedToken.email_verified || !email) {
            throw new CustomError(
                ERROR_CODES.AUTH_TOKEN_INVALID,
                'Google account email is not verified'
            );
        }

        const isAuthorized =
            (loginType === 'admin' &&
                (isAdminDomain || isSpecialAccount)) ||
            (loginType === 'student' &&
                (isStudentDomain || isSpecialAccount));

        if (!isAuthorized) {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_INSUFFICIENT_PERMISSIONS,
                'This account is not authorized for this login type'
            );
        }

        let user = await User.findOne({
            $or: [
                { firebaseUid: decodedToken.uid },
                { email }
            ]
        });

        if (user && !user.isActive) {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_ACCOUNT_INACTIVE,
                'Account is disabled'
            );
        }

        const effectiveRole =
            loginType === 'admin' && (isAdminDomain || isSpecialAccount)
                ? 'admin'
                : 'user';

        if (!user) {
            user = await User.create({
                firebaseUid: decodedToken.uid,
                email,
                name: decodedToken.name || email.split('@')[0],
                role: effectiveRole
            });
        } else {
            let userChanged = false;
            if (user.firebaseUid !== decodedToken.uid) {
                user.firebaseUid = decodedToken.uid;
                userChanged = true;
            }
            if (user.role !== effectiveRole) {
                user.role = effectiveRole;
                userChanged = true;
            }
            if (userChanged) await user.save();
        }

        const token = generateToken({
            id: user._id,
            loginType
        });

        const refreshToken = generateRefreshToken({
            id: user._id,
            loginType
        });

        return res.status(200).json({
            success: true,
            message: 'Google login successful',
            token,
            refreshToken,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                loginType
            }
        });

    } catch (error) {
        if (error.code?.startsWith('auth/')) {
            console.error('Firebase token verification error:', {
                code: error.code,
                message: error.message
            });

            return next(
                new CustomError(
                    ERROR_CODES.AUTH_TOKEN_INVALID,
                    'Invalid Google authentication token'
                )
            );
        }

        console.error('Google login error:', error);
        return next(error);
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

        const decoded = verifyRefreshToken(refreshToken);

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

        const loginType = decoded.loginType;

        if (!['admin', 'student'].includes(loginType)) {
            throw new CustomError(
                ERROR_CODES.AUTH_TOKEN_INVALID,
                'Invalid login context'
            );
        }

        const email = user.email?.trim().toLowerCase();
        const specialEmail = '6631503019@lamduan.mfu.ac.th';

        const isSpecial = email === specialEmail;
        const isAdmin =
            (email?.endsWith('@mfu.ac.th') && !email?.endsWith('@lamduan.mfu.ac.th')) ||
            isSpecial;
        const isStudent = email?.endsWith('@lamduan.mfu.ac.th') || isSpecial;

        const isAuthorized =
            (loginType === 'admin' && isAdmin) ||
            (loginType === 'student' && isStudent);

        if (!isAuthorized) {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_INSUFFICIENT_PERMISSIONS,
                'This account is not authorized for this login type'
            );
        }

        const effectiveRole =
            loginType === 'admin' && isAdmin ? 'admin' : 'user';
        if (user.role !== effectiveRole) {
            user.role = effectiveRole;
            await user.save();
        }

        const token = generateToken({
            id: user._id,
            loginType
        });

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: effectiveRole,
                loginType
            }
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

        return next(error);
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