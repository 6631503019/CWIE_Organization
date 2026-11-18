const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { uploadDirectories } = require('../config/uploads');
const { CustomError, ERROR_CODES } = require('../utils/customError');

const createUploadTypeError = message => {
    const error = new CustomError(ERROR_CODES.VALIDATION_FILE_TYPE_INVALID, message);
    error.status = error.statusCode;
    return error;
};

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'logo') {
            cb(null, uploadDirectories.logos);
        } else if (file.fieldname === 'mou') {
            cb(null, uploadDirectories.mou);
        } else if (file.fieldname === 'poster') {
            cb(null, uploadDirectories.posters);
        } else if (file.fieldname === 'activity_image') {
            cb(null, uploadDirectories.activities);
        } else {
            cb(createUploadTypeError('Unsupported upload field'), false);
        }
    },
    filename: function (req, file, cb) {
        const extension = file.fieldname === 'mou' ? '.pdf' : path.extname(file.originalname).toLowerCase();
        const safeExtension = /^[.][a-z0-9]{1,10}$/i.test(extension) ? extension : '';
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${safeExtension}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'mou') {
        const lowerName = file.originalname.toLowerCase();
        if (file.mimetype === 'application/pdf' && lowerName.endsWith('.pdf')) {
            cb(null, true);
        } else {
            cb(createUploadTypeError('Only PDF files are allowed for MOU'), false);
        }
    } else {
        // Allow images for other fields
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(createUploadTypeError('Only image files are allowed'), false);
        }
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

const uploadMou = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter
});

const uploadRoadshow = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 11
    },
    fileFilter
});

module.exports = upload;
module.exports.uploadMou = uploadMou;
module.exports.uploadRoadshow = uploadRoadshow;