const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const { importOrganizations } = require('../controllers/importController');
const { CustomError, ERROR_CODES } = require('../utils/customError');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/imports/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const fileExtension = path.extname(file.originalname || '').toLowerCase();
    const allowedMimeTypesByExtension = {
        '.csv': new Set(['text/csv', 'application/csv', 'text/plain', 'application/octet-stream']),
        '.xlsx': new Set([
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip',
            'application/octet-stream',
            'application/vnd.ms-excel'
        ]),
        '.xls': new Set(['application/vnd.ms-excel', 'application/octet-stream', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
    };
    const allowedMimeTypes = allowedMimeTypesByExtension[fileExtension];

    if (!allowedMimeTypes) {
        return cb(new Error('Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)'), false);
    }

    // Some browsers send an empty or generic MIME type for local files.
    if (file.mimetype && !allowedMimeTypes.has(file.mimetype)) {
        return cb(new Error('File extension and MIME type do not match'), false);
    }

    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB limit
    }
});

const uploadOrganizationFile = (req, res, next) => {
    upload.single('file')(req, res, (error) => {
        if (!error) return next();

        if (error.code === 'LIMIT_FILE_SIZE') {
            return next(new CustomError(
                ERROR_CODES.VALIDATION_FILE_SIZE_TOO_LARGE,
                'File size too large. Maximum 25MB allowed'
            ));
        }

        return next(new CustomError(
            ERROR_CODES.VALIDATION_FILE_TYPE_INVALID,
            error.message || 'Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)'
        ));
    });
};

// Routes
router.post('/organizations', protect, authorize('admin'), uploadOrganizationFile, importOrganizations);

module.exports = router;
