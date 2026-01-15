const { ERROR_CODES, getErrorMessage, getHttpStatusFromErrorCode } = require('./errorCodes');

class CustomError extends Error {
    constructor(errorCode, customMessage = null, additionalData = {}) {
        const message = getErrorMessage(errorCode, customMessage);
        super(message);

        this.errorCode = errorCode;
        this.statusCode = getHttpStatusFromErrorCode(errorCode);
        this.isOperational = true;
        this.additionalData = additionalData;
        this.timestamp = new Date().toISOString();

        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            success: false,
            message: this.message,
            errorCode: this.errorCode,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            ...(Object.keys(this.additionalData).length > 0 && { data: this.additionalData })
        };
    }
}

// Factory functions for common errors
const createValidationError = (field, value, customMessage = null) => {
    return new CustomError(
        ERROR_CODES.VALIDATION_GENERAL_ERROR,
        customMessage,
        { field, value }
    );
};

const createNotFoundError = (resource, id = null) => {
    const errorCodeMap = {
        'user': ERROR_CODES.NOT_FOUND_USER,
        'organization': ERROR_CODES.NOT_FOUND_ORGANIZATION,
        'review': ERROR_CODES.NOT_FOUND_REVIEW,
        'mou': ERROR_CODES.NOT_FOUND_MOU,
        'roadshow': ERROR_CODES.NOT_FOUND_ROADSHOW,
        'file': ERROR_CODES.NOT_FOUND_FILE
    };

    const errorCode = errorCodeMap[resource.toLowerCase()] || ERROR_CODES.NOT_FOUND_RESOURCE;
    return new CustomError(errorCode, null, { resource, id });
};

const createAuthError = (type, additionalData = {}) => {
    const errorCodeMap = {
        'invalid_credentials': ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        'token_expired': ERROR_CODES.AUTH_TOKEN_EXPIRED,
        'token_invalid': ERROR_CODES.AUTH_TOKEN_INVALID,
        'user_not_found': ERROR_CODES.AUTH_USER_NOT_FOUND,
        'account_inactive': ERROR_CODES.FORBIDDEN_ACCOUNT_INACTIVE
    };

    const errorCode = errorCodeMap[type] || ERROR_CODES.AUTH_TOKEN_INVALID;
    return new CustomError(errorCode, null, additionalData);
};

module.exports = {
    CustomError,
    createValidationError,
    createNotFoundError,
    createAuthError,
    ERROR_CODES
};