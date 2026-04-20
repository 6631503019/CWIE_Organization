const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { CustomError, createNotFoundError, ERROR_CODES } = require('../utils/customError');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
                'Name, email and password are required'
            );
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_EMAIL_INVALID,
                'Please provide a valid email address'
            );
        }

        // Validate password strength
        if (password.length < 6) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_PASSWORD_TOO_SHORT,
                'Password must be at least 6 characters long'
            );
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_EMAIL_DUPLICATE,
                'User with this email already exists'
            );
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: email === 'admin@mfu.ac.th' ? 'admin' : 'user'
        });

        // Generate tokens
        const token = generateToken({ id: user._id });
        const refreshToken = generateRefreshToken({ id: user._id });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
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
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
                'Please provide email and password'
            );
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            throw new CustomError(
                ERROR_CODES.AUTH_USER_NOT_FOUND,
                'User not found'
            );
        }

        // Check if account is active
        if (!user.isActive) {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_ACCOUNT_INACTIVE,
                'Account is disabled'
            );
        }

        // Validate password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new CustomError(
                ERROR_CODES.AUTH_INVALID_CREDENTIALS,
                'Invalid password'
            );
        }

        // Generate tokens
        const token = generateToken({ id: user._id });
        const refreshToken = generateRefreshToken({ id: user._id });

        res.status(200).json({
            success: true,
            message: 'Login successful',
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
    register,
    login,
    refresh,
    getMe
};