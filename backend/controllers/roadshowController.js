const Roadshow = require('../models/Roadshow');
const InternshipRecord = require('../models/InternshipRecord');
const { CustomError, createNotFoundError, ERROR_CODES } = require('../utils/customError');
const { deleteStoredFile } = require('../utils/fileCleanup');
const { normalizeRoadshowTime } = require('../utils/roadshowTime');

// @desc    Get all roadshows
// @route   GET /api/roadshows
// @access  Public
const getRoadshows = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = req.query.public !== 'false' ? { is_public: true } : {};

        // Filter by upcoming events only if requested
        if (req.query.upcoming === 'true') {
            filter.event_date = { $gte: new Date() };
        }

        const roadshows = await Roadshow.find(filter)
            .populate('organization_id', 'organization_name_en organization_name_th')
            .sort({ event_date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Roadshow.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Roadshows retrieved successfully',
            data: roadshows,
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

// @desc    Get single roadshow
// @route   GET /api/roadshows/:id
// @access  Public
const getRoadshow = async (req, res, next) => {
    try {
        const roadshow = await Roadshow.findById(req.params.id)
            .populate('organization_id', 'organization_name_en organization_name_th');

        if (!roadshow) {
            throw createNotFoundError('roadshow', req.params.id);
        }

        // Check if roadshow is public or user has permission
        if (!roadshow.is_public && (!req.user || req.user.role !== 'admin')) {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS_DENIED,
                'This roadshow is private',
                { roadshowId: req.params.id }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Roadshow retrieved successfully',
            data: roadshow
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create roadshow
// @route   POST /api/roadshows
// @access  Private (Admin)
const createRoadshow = async (req, res, next) => {
    try {
        const { topic, details, event_date, organization_id, organization } = req.body;

        // Check required fields
        const requiredFields = ['topic', 'details', 'event_date', 'posted_date'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
                'Missing required fields',
                { missingFields }
            );
        }
        if (organization !== undefined) {
            req.body.organization = String(organization).trim();
        }
        ['organization_en', 'organization_th', 'title_en', 'title_th'].forEach((field) => {
            if (req.body[field] !== undefined) {
                req.body[field] = String(req.body[field]).trim();
            }
        });
        if (organization_id) {
            const organization = await InternshipRecord.findOne({ _id: organization_id, record_type: 'organization' });
            if (!organization) {
                throw createNotFoundError('organization', organization_id);
            }
        }

        if (req.body.time !== undefined && req.body.time !== '') {
            try {
                req.body.time = normalizeRoadshowTime(req.body.time);
            } catch (error) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_INVALID_FORMAT,
                    error.message,
                    { field: 'time' }
                );
            }
        }

        // Validate event date
        const eventDate = new Date(event_date);
        if (isNaN(eventDate.getTime())) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_DATE_INVALID,
                'Invalid event date format'
            );
        }

        // Check if event date is in the past (optional warning)
        if (eventDate < new Date()) {
            console.warn('Warning: Event date is in the past');
        }

        // Handle file uploads
        if (req.files) {
            if (req.files.poster) {
                req.body.poster_path = '/' + req.files.poster[0].path.replace(/\\/g, '/').replace(/^\/+/, '');
            }
            if (req.files.activity_image) {
                req.body.activity_image_paths = req.files.activity_image.map(file =>
                    '/' + file.path.replace(/\\/g, '/').replace(/^\/+/, '')
                );
            }
        }

        // Convert is_public from string to boolean (FormData always sends strings)
        if (typeof req.body.is_public === 'string') {
            req.body.is_public = req.body.is_public === 'true' || req.body.is_public === '1';
        }

        // Add admin ID from authenticated user
        req.body.admin_id = req.user._id;

        const roadshow = await Roadshow.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Roadshow created successfully',
            data: roadshow
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update roadshow
// @route   PUT /api/roadshows/:id
// @access  Private (Admin)
const updateRoadshow = async (req, res, next) => {
    try {
        const roadshow = await Roadshow.findById(req.params.id);

        if (!roadshow) {
            throw createNotFoundError('roadshow', req.params.id);
        }
        if (req.body.organization !== undefined) {
            req.body.organization = String(req.body.organization).trim();
        }
        ['organization_en', 'organization_th', 'title_en', 'title_th'].forEach((field) => {
            if (req.body[field] !== undefined) {
                req.body[field] = String(req.body[field]).trim();
            }
        });
        if (req.body.organization_id) {
            const organization = await InternshipRecord.findOne({ _id: req.body.organization_id, record_type: 'organization' });
            if (!organization) {
                throw createNotFoundError('organization', req.body.organization_id);
            }
        }

        // Validate event date if provided
        if (req.body.event_date) {
            const eventDate = new Date(req.body.event_date);
            if (isNaN(eventDate.getTime())) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_DATE_INVALID,
                    'Invalid event date format'
                );
            }

        }

        if (req.body.time !== undefined && req.body.time !== '') {
            try {
                req.body.time = normalizeRoadshowTime(req.body.time);
            } catch (error) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_INVALID_FORMAT,
                    error.message,
                    { field: 'time' }
                );
            }
        }

        // Handle file uploads
        if (req.files) {
            if (req.files.poster) {
                if (roadshow.poster_path) {
                    deleteStoredFile(roadshow.poster_path, 'old roadshow poster');
                }
                req.body.poster_path = '/' + req.files.poster[0].path.replace(/\\/g, '/').replace(/^\/+/, '');
            }
            if (req.files.activity_image) {
                if (Array.isArray(roadshow.activity_image_paths)) {
                    roadshow.activity_image_paths.forEach(path =>
                        deleteStoredFile(path, 'old roadshow activity image')
                    );
                }
                req.body.activity_image_paths = req.files.activity_image.map(file =>
                    '/' + file.path.replace(/\\/g, '/').replace(/^\/+/, '')
                );
            }
        }

        // Convert is_public from string to boolean (FormData always sends strings)
        if (typeof req.body.is_public === 'string') {
            req.body.is_public = req.body.is_public === 'true' || req.body.is_public === '1';
        }

        const updatedRoadshow = await Roadshow.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('organization_id', 'organization_name_en organization_name_th');

        res.status(200).json({
            success: true,
            message: 'Roadshow updated successfully',
            data: updatedRoadshow
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete roadshow
// @route   DELETE /api/roadshows/:id
// @access  Private (Admin)
const deleteRoadshow = async (req, res, next) => {
    try {
        const roadshow = await Roadshow.findById(req.params.id);

        if (!roadshow) {
            throw createNotFoundError('roadshow', req.params.id);
        }

        if (roadshow.poster_path) {
            deleteStoredFile(roadshow.poster_path, 'roadshow poster');
        }

        if (Array.isArray(roadshow.activity_image_paths)) {
            roadshow.activity_image_paths.forEach(path =>
                deleteStoredFile(path, 'roadshow activity image')
            );
        }

        await Roadshow.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Roadshow deleted successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRoadshows,
    getRoadshow,
    createRoadshow,
    updateRoadshow,
    deleteRoadshow
};