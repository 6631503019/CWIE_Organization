const MOU = require('../models/MOU');
const InternshipRecord = require('../models/InternshipRecord');
const fs = require('fs');
const { CustomError, createNotFoundError, ERROR_CODES } = require('../utils/customError');
const { resolveStoredPath } = require('../utils/fileCleanup');
const { getPublicUploadPath } = require('../config/uploads');
const {
    uploadPdfToGridFS,
    openGridFSFile,
    deleteGridFSFile
} = require('../config/gridfs');

const removeTemporaryUpload = file => {
    if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
};

const persistMouUpload = async file => {
    if (!file) return null;
    const gridfsId = await uploadPdfToGridFS(file);
    removeTemporaryUpload(file);
    return {
        mou_gridfs_id: gridfsId,
        mou_file_path: null,
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
        const searchText = String(req.query.search || '').trim();

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
        if (searchText) {
            const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(escapedSearch, 'i');
            const matchingOrganizations = await InternshipRecord.find({
                record_type: 'organization',
                $or: [
                    { organization_name_th: searchRegex },
                    { organization_name_en: searchRegex },
                    { organization_email: searchRegex },
                    { organization_type: searchRegex },
                    { province_th: searchRegex },
                    { province_en: searchRegex },
                    { country_th: searchRegex },
                    { country_en: searchRegex }
                ]
            }).select('_id').lean();
            const organizationIds = matchingOrganizations.map(item => item._id);
            const searchConditions = [{ organization_id: { $in: organizationIds } }];
            if (req.query.search) {
                searchConditions.push({
                    $or: [
                        { mou_original_name: searchRegex },
                        { mou_file_path: searchRegex }
                    ]
                });
            }
            filter.$and = [...(filter.$and || []), { $or: searchConditions }];
        }

        const mous = await MOU.find(filter)
            .populate('organization_id', 'organization_name_en organization_name_th logo_path logo_gridfs_id organization_type business_type_en business_type_th school_en school_th province_en province_th country_en country_th organization_email telephone details')
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
            .populate('organization_id', 'organization_name_en organization_name_th logo_path logo_gridfs_id organization_email address_en address_th organization_type country_id province_id telephone details business_type_en business_type_th school_en school_th province_en province_th country_en country_th');

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
            req.body.mou_file_path = null;
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
            ).catch(async updateError => {
                if (uploadedStorage.mou_gridfs_id) {
                    await deleteGridFSFile(uploadedStorage.mou_gridfs_id).catch(() => undefined);
                }
                throw updateError;
            });

            if (existingMOU.mou_gridfs_id) {
                await deleteGridFSFile(existingMOU.mou_gridfs_id).catch(() => undefined);
            }

            console.log('CREATE - Updated MOU:', updatedMOU._id, 'is_published:', updatedMOU.is_published);

            return res.status(200).json({
                success: true,
                message: 'MOU updated successfully',
                data: updatedMOU
            });
        }

        Object.assign(req.body, uploadedStorage);
        req.body.mou_file_path = null;

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
        } catch (createError) {
            if (uploadedStorage.mou_gridfs_id) {
                await deleteGridFSFile(uploadedStorage.mou_gridfs_id).catch(() => undefined);
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
        const mou = await MOU.findById(req.params.id);
        validatePublicationWindow(req.body);

        if (!mou) {
            throw createNotFoundError('mou', req.params.id);
        }

        if (req.body.organization_id) {
            const organization = await InternshipRecord.findOne({
                _id: req.body.organization_id,
                record_type: 'organization'
            });
            if (!organization) {
                throw createNotFoundError('organization', req.body.organization_id);
            }
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
            req.body.mou_file_path = null;
        }

        let updatedMOU;
        try {
            updatedMOU = await MOU.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
        } catch (updateError) {
            if (newUpload?.mou_gridfs_id) {
                await deleteGridFSFile(newUpload.mou_gridfs_id).catch(() => undefined);
            }
            throw updateError;
        }

        if (newUpload) {
            if (mou.mou_gridfs_id) {
                await deleteGridFSFile(mou.mou_gridfs_id).catch(() => undefined);
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

        if (mou.mou_gridfs_id) {
            await deleteGridFSFile(mou.mou_gridfs_id).catch(error => {
                console.error('Failed to delete MOU GridFS file', {
                    mouId: String(mou._id),
                    code: error?.code || error?.name || 'UNKNOWN'
                });
            });
        }
        // Keep legacy local files untouched.

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
        const setPdfHeaders = contentLength => {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition',
                `${download ? 'attachment' : 'inline'}; filename="${mou.mou_original_name || 'mou.pdf'}"`);
            res.setHeader('X-Content-Type-Options', 'nosniff');
            if (contentLength) res.setHeader('Content-Length', contentLength);
        };

        if (mou.mou_gridfs_id) {
            try {
                const gridfs = await openGridFSFile(mou.mou_gridfs_id);
                setPdfHeaders(gridfs.file.length);
                gridfs.stream.pipe(res);
                return;
            } catch (error) {
                const code = error?.code;
                if (code === 'DATABASE_UNAVAILABLE') {
                    throw new CustomError(
                        ERROR_CODES.SERVICE_DATABASE_UNAVAILABLE,
                        'MOU file storage is temporarily unavailable',
                        { mouId: req.params.id }
                    );
                }
                if (code === 'GRIDFS_FILE_NOT_FOUND') {
                    throw createNotFoundError('file', req.params.id);
                }
                if (code === 'INVALID_GRIDFS_ID') {
                    throw createNotFoundError('file', req.params.id);
                }
                throw new CustomError(
                    ERROR_CODES.SERVICE_DATABASE_UNAVAILABLE,
                    'MOU file storage is temporarily unavailable',
                    { mouId: req.params.id }
                );
            }
        }

        if (mou.mou_file_path) {
            const absolutePath = resolveStoredPath(mou.mou_file_path);
            if (absolutePath && fs.existsSync(absolutePath)) {
                const stat = fs.statSync(absolutePath);
                setPdfHeaders(stat.size);
                fs.createReadStream(absolutePath).pipe(res);
                return;
            }
        }

        throw createNotFoundError('file', req.params.id);
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