const MOU = require('../models/MOU');
const InternshipRecord = require('../models/InternshipRecord');
const fs = require('fs');
const { CustomError, createNotFoundError, ERROR_CODES } = require('../utils/customError');
const { deleteStoredFile, resolveStoredPath } = require('../utils/fileCleanup');
const { getPublicUploadPath } = require('../config/uploads');
const {
    isR2Configured,
    uploadMouFile,
    getMouObject,
    deleteMouObject
} = require('../config/objectStorage');

const removeTemporaryUpload = file => {
    if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
};

const persistMouUpload = async file => {
    if (!file) return null;
    if (isR2Configured()) {
        const stored = await uploadMouFile(file);
        removeTemporaryUpload(file);
        return {
            mou_file_path: `/api/mou/pending/file`,
            mou_object_key: stored.objectKey,
            mou_storage_provider: stored.provider,
            mou_original_name: stored.originalName,
            mou_file_size: stored.size
        };
    }
    return {
        mou_file_path: getPublicUploadPath('mou', file.filename),
        mou_storage_provider: 'disk',
        mou_original_name: file.originalname,
        mou_file_size: file.size
    };
};

const parseOptionalDate = (value, field) => {
    if (value === undefined || value === null) return undefined;
    if (value === '') return null;
    const dateValue = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
        ? `${value}:00+07:00`
        : value;
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
        throw new CustomError(ERROR_CODES.VALIDATION_DATE_INVALID, `Invalid ${field} format`, { field });
    }
    return parsed;
};

const validatePublicationWindow = (body) => {
    const start = parseOptionalDate(body.publication_start_at, 'publication_start_at');
    const end = parseOptionalDate(body.publication_end_at, 'publication_end_at');
    if (start && end && start >= end) {
        throw new CustomError(ERROR_CODES.VALIDATION_INVALID_RANGE, 'Publication start must be before publication end');
    }
    if (start !== undefined) body.publication_start_at = start;
    if (end !== undefined) body.publication_end_at = end;
};

const isPublishedNow = mou => {
    const now = new Date();
    return mou.is_published !== false &&
        (!mou.publication_start_at || mou.publication_start_at <= now) &&
        (!mou.publication_end_at || mou.publication_end_at > now);
};

// @desc    Get all MOUs
// @route   GET /api/mou
// @access  Public
const getMOUs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const isStudentRequest = !req.user || req.user.role !== 'admin';
        let filter = {};
        if (isStudentRequest) {
            filter.is_published = true;
            filter.$and = [
                { $or: [{ publication_start_at: null }, { publication_start_at: { $lte: new Date() } }] },
                { $or: [{ publication_end_at: null }, { publication_end_at: { $gt: new Date() } }] }
            ];
        } else if (req.query.published === 'true') {
            filter.is_published = true;
        } else if (req.query.published === 'false') {
            filter.is_published = false;
        }
        // If published not specified or 'all', show all MOUs

        const mous = await MOU.find(filter)
            .populate('organization_id', 'organization_name_en organization_name_th logo_path organization_type business_type_en business_type_th school_en school_th province_en province_th country_en country_th organization_email telephone details')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await MOU.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'MOUs retrieved successfully',
            data: mous,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single MOU
// @route   GET /api/mou/:id
// @access  Public
const getMOU = async (req, res, next) => {
    try {
        const mou = await MOU.findById(req.params.id)
            .populate('organization_id', 'organization_name_en organization_name_th logo_path organization_email address_en address_th organization_type country_id province_id telephone details business_type_en business_type_th school_en school_th province_en province_th country_en country_th');

        if (!mou) {
            throw createNotFoundError('mou', req.params.id);
        }

        // Check if MOU is published or user has permission
        if (!isPublishedNow(mou) && (!req.user || req.user.role !== 'admin')) {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS_DENIED,
                'This MOU is not published',
                { mouId: req.params.id }
            );
        }

        res.status(200).json({
            success: true,
            message: 'MOU retrieved successfully',
            data: mou
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create MOU
// @route   POST /api/mou
// @access  Private (Admin)
const createMOU = async (req, res, next) => {
    try {
        console.log('========== CREATE MOU REQUEST ==========');
        console.log('req.body:', req.body);
        console.log('req.file:', req.file ? req.file.filename : 'No file');
        console.log('=====================================');

        const { organization_id } = req.body;
        validatePublicationWindow(req.body);

        // Check required fields
        if (!organization_id) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
                'Organization ID is required'
            );
        }

        // Check if organization exists
        const organization = await InternshipRecord.findOne({ _id: organization_id, record_type: 'organization' });
        if (!organization) {
            throw createNotFoundError('organization', organization_id);
        }

        // Check if file is uploaded
        if (!req.file) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_FILE_REQUIRED,
                'MOU file is required'
            );
        }

        // Validate file type (should be PDF)
        if (req.file.mimetype !== 'application/pdf') {
            throw new CustomError(
                ERROR_CODES.VALIDATION_FILE_TYPE_INVALID,
                'MOU file must be PDF format',
                { receivedType: req.file.mimetype }
            );
        }

        let uploadedStorage;
        try {
            uploadedStorage = await persistMouUpload(req.file);
        } catch (uploadError) {
            removeTemporaryUpload(req.file);
            throw uploadError;
        }

        // Check if MOU already exists for this organization
        const existingMOU = await MOU.findOne({ organization_id });
        if (existingMOU) {
            // Update existing MOU instead of throwing error
            console.log('MOU already exists, updating instead:', existingMOU._id);
            Object.assign(req.body, uploadedStorage);
            req.body.mou_file_path = uploadedStorage.provider === 'r2'
                ? `/api/mou/${existingMOU._id}/file`
                : uploadedStorage.mou_file_path;
            req.body.admin_id = req.user._id;

            // Convert is_published from string to boolean if needed
            if (req.body.is_published !== undefined) {
                console.log('CREATE - Received is_published:', req.body.is_published, 'Type:', typeof req.body.is_published);

                if (typeof req.body.is_published === 'string') {
                    req.body.is_published = req.body.is_published === 'true' || req.body.is_published === '1';
                }

                console.log('CREATE - Converted is_published to:', req.body.is_published, 'Type:', typeof req.body.is_published);
            }

            const updatedMOU = await MOU.findByIdAndUpdate(
                existingMOU._id,
                req.body,
                { new: true, runValidators: true }
            );

            if (existingMOU.mou_storage_provider === 'r2' && existingMOU.mou_object_key) {
                await deleteMouObject(existingMOU.mou_object_key).catch(() => undefined);
            } else if (existingMOU.mou_file_path) {
                deleteStoredFile(existingMOU.mou_file_path, 'old MOU file');
            }

            console.log('CREATE - Updated MOU:', updatedMOU._id, 'is_published:', updatedMOU.is_published);

            return res.status(200).json({
                success: true,
                message: 'MOU updated successfully',
                data: updatedMOU
            });
        }

        Object.assign(req.body, uploadedStorage);
        req.body.mou_file_path = uploadedStorage.provider === 'r2'
            ? '/api/mou/pending/file'
            : uploadedStorage.mou_file_path;

        // Add admin ID from authenticated user
        req.body.admin_id = req.user._id;

        // Convert is_published from string to boolean if needed
        if (req.body.is_published !== undefined) {
            console.log('CREATE NEW - Received is_published:', req.body.is_published, 'Type:', typeof req.body.is_published);

            if (typeof req.body.is_published === 'string') {
                req.body.is_published = req.body.is_published === 'true' || req.body.is_published === '1';
            }

            console.log('CREATE NEW - Converted is_published to:', req.body.is_published, 'Type:', typeof req.body.is_published);
        }

        let mou;
        try {
            mou = await MOU.create(req.body);
            if (uploadedStorage.provider === 'r2') {
                mou.mou_file_path = `/api/mou/${mou._id}/file`;
                await mou.save();
            }
        } catch (createError) {
            if (uploadedStorage.provider === 'r2' && uploadedStorage.mou_object_key) {
                await deleteMouObject(uploadedStorage.mou_object_key).catch(() => undefined);
            }
            throw createError;
        }

        console.log('CREATE NEW - Created MOU:', mou._id, 'is_published:', mou.is_published);

        res.status(201).json({
            success: true,
            message: 'MOU created successfully',
            data: mou
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update MOU
// @route   PUT /api/mou/:id
// @access  Private (Admin)
const updateMOU = async (req, res, next) => {
    try {
        console.log('========== UPDATE MOU REQUEST ==========');
        console.log('req.params.id:', req.params.id);
        console.log('req.body:', req.body);
        console.log('req.file:', req.file ? req.file.filename : 'No file');
        console.log('=====================================');

        const mou = await MOU.findById(req.params.id);
        validatePublicationWindow(req.body);

        if (!mou) {
            throw createNotFoundError('mou', req.params.id);
        }

        // Convert is_published from string to boolean if needed
        if (req.body.is_published !== undefined) {
            console.log('Received is_published:', req.body.is_published, 'Type:', typeof req.body.is_published);

            if (typeof req.body.is_published === 'string') {
                req.body.is_published = req.body.is_published === 'true' || req.body.is_published === '1';
            }

            console.log('Converted is_published to:', req.body.is_published, 'Type:', typeof req.body.is_published);
        }

        let newUpload = null;
        if (req.file) {
            if (req.file.mimetype !== 'application/pdf') {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_FILE_TYPE_INVALID,
                    'MOU file must be PDF format',
                    { receivedType: req.file.mimetype }
                );
            }
            newUpload = await persistMouUpload(req.file);
            Object.assign(req.body, newUpload);
            if (newUpload.provider === 'r2') {
                req.body.mou_file_path = `/api/mou/${mou._id}/file`;
            }
        }

        const updatedMOU = await MOU.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (newUpload) {
            if (mou.mou_storage_provider === 'r2' && mou.mou_object_key) {
                await deleteMouObject(mou.mou_object_key).catch(() => undefined);
            } else if (mou.mou_file_path) {
                deleteStoredFile(mou.mou_file_path, 'old MOU file');
            }
        }

        console.log('Updated MOU:', updatedMOU._id, 'is_published:', updatedMOU.is_published);

        res.status(200).json({
            success: true,
            message: 'MOU updated successfully',
            data: updatedMOU
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete MOU
// @route   DELETE /api/mou/:id
// @access  Private (Admin)
const deleteMOU = async (req, res, next) => {
    try {
        const mou = await MOU.findById(req.params.id);

        if (!mou) {
            throw createNotFoundError('mou', req.params.id);
        }

        // Delete associated MOU file if exists
        if (mou.mou_file_path) {
            if (mou.mou_storage_provider === 'r2' && mou.mou_object_key) {
                await deleteMouObject(mou.mou_object_key).catch(() => undefined);
            } else {
                deleteStoredFile(mou.mou_file_path, 'MOU file');
            }
        }

        await MOU.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'MOU deleted successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Stream or download MOU PDF
// @route   GET /api/mou/:id/file
// @access  Private/Public according to publication and schedule
const getMOUFile = async (req, res, next) => {
    try {
        const mou = await MOU.findById(req.params.id);
        if (!mou) {
            throw createNotFoundError('mou', req.params.id);
        }

        if (!isPublishedNow(mou) && req.user?.role !== 'admin') {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS_DENIED,
                'This MOU is not published',
                { mouId: req.params.id }
            );
        }

        const download = req.query.download === '1';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `${download ? 'attachment' : 'inline'}; filename="${mou.mou_original_name || 'mou.pdf'}"`);
        res.setHeader('X-Content-Type-Options', 'nosniff');

        if (mou.mou_storage_provider === 'r2' && mou.mou_object_key) {
            const object = await getMouObject(mou.mou_object_key);
            if (object.ContentLength) res.setHeader('Content-Length', object.ContentLength);
            object.Body.pipe(res);
            return;
        }

        const absolutePath = resolveStoredPath(mou.mou_file_path);
        if (!absolutePath || !fs.existsSync(absolutePath)) {
            throw createNotFoundError('file', req.params.id);
        }
        fs.createReadStream(absolutePath).pipe(res);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMOUs,
    getMOU,
    createMOU,
    updateMOU,
    deleteMOU,
    getMOUFile
};