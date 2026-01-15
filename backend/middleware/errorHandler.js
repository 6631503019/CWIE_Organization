const { CustomError, ERROR_CODES } = require('../utils/customError');
const multer = require('multer');

const errorHandler = (err, req, res, next) => {
    console.error('Error Details:', {
        message: err.message,
        stack: err.stack,
        errorCode: err.errorCode,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
    });

    // Custom operational error
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json(err.toJSON());
    }

    // Mongoose CastError (Invalid ObjectId)
    if (err.name === 'CastError') {
        const error = new CustomError(
            ERROR_CODES.VALIDATION_ID_INVALID,
            `Invalid ${err.path}: ${err.value}`,
            { field: err.path, value: err.value }
        );
        return res.status(error.statusCode).json(error.toJSON());
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];

        let errorCode = ERROR_CODES.CONFLICT_DUPLICATE_ENTRY;

        // Specific error codes based on field
        if (field === 'email') {
            errorCode = ERROR_CODES.VALIDATION_EMAIL_DUPLICATE;
        } else if (field === 'phone_number') {
            errorCode = ERROR_CODES.VALIDATION_PHONE_DUPLICATE;
        }

        const error = new CustomError(
            errorCode,
            `${field} '${value}' already exists`,
            { field, value }
        );
        return res.status(error.statusCode).json(error.toJSON());
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => {
            let errorCode = ERROR_CODES.VALIDATION_GENERAL_ERROR;

            // Specific validation error codes
            if (val.kind === 'required') {
                errorCode = ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD;
            } else if (val.kind === 'minlength' || val.kind === 'maxlength') {
                errorCode = ERROR_CODES.VALIDATION_INVALID_LENGTH;
            } else if (val.kind === 'min' || val.kind === 'max') {
                errorCode = ERROR_CODES.VALIDATION_INVALID_RANGE;
            } else if (val.kind === 'enum') {
                errorCode = ERROR_CODES.VALIDATION_INVALID_TYPE;
            }

            return {
                field: val.path,
                message: val.message,
                errorCode,
                value: val.value
            };
        });

        const error = new CustomError(
            ERROR_CODES.VALIDATION_GENERAL_ERROR,
            'Validation failed',
            { errors }
        );
        return res.status(error.statusCode).json(error.toJSON());
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        const error = new CustomError(ERROR_CODES.AUTH_TOKEN_INVALID);
        return res.status(error.statusCode).json(error.toJSON());
    }

    if (err.name === 'TokenExpiredError') {
        const error = new CustomError(ERROR_CODES.AUTH_TOKEN_EXPIRED);
        return res.status(error.statusCode).json(error.toJSON());
    }

    // Multer File Upload Errors
    if (err instanceof multer.MulterError) {
        let errorCode = ERROR_CODES.FILE_UPLOAD_ERROR;

        if (err.code === 'LIMIT_FILE_SIZE') {
            errorCode = ERROR_CODES.VALIDATION_FILE_SIZE_TOO_LARGE;
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            errorCode = ERROR_CODES.VALIDATION_GENERAL_ERROR;
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            errorCode = ERROR_CODES.VALIDATION_FILE_TYPE_INVALID;
        }

        const error = new CustomError(
            errorCode,
            err.message,
            { multerCode: err.code, field: err.field }
        );
        return res.status(error.statusCode).json(error.toJSON());
    }

    // MongoDB Connection Errors
    if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
        const error = new CustomError(ERROR_CODES.DATABASE_CONNECTION_ERROR);
        return res.status(error.statusCode).json(error.toJSON());
    }

    // Rate Limit Errors
    if (err.status === 429) {
        const error = new CustomError(ERROR_CODES.RATE_LIMIT_EXCEEDED);
        return res.status(error.statusCode).json(error.toJSON());
    }

    // Default Server Error
    const error = new CustomError(
        ERROR_CODES.SERVER_INTERNAL_ERROR,
        process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}
    );

    return res.status(error.statusCode).json(error.toJSON());
};

const notFound = (req, res, next) => {
    const error = new CustomError(
        ERROR_CODES.NOT_FOUND_ENDPOINT,
        `Route ${req.originalUrl} not found`,
        { method: req.method, path: req.originalUrl }
    );
    res.status(error.statusCode).json(error.toJSON());
};

module.exports = {
    errorHandler,
    notFound
};