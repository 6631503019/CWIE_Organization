const Roadshow = require('../models/Roadshow');
const Notification = require('../models/Notification');
const { CustomError, createNotFoundError, ERROR_CODES } = require('../utils/customError');
const { deleteStoredFile } = require('../utils/fileCleanup');

// @desc    Get all roadshows
// @route   GET /api/roadshows
// @access  Public
const getRoadshows = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};

        // Filter by public/private
        if (req.query.public !== 'false') {
            filter.is_public = true;
        }

        // Filter by upcoming events only if requested
        if (req.query.upcoming === 'true') {
            filter.event_date = { $gte: new Date() };
        }

        // Auto-exclude roadshows with deleted_date in the past
        const now = new Date();
        filter.$and = [
            { $or: [{ deleted_date: null }, { deleted_date: { $gte: now } }] }
        ];

        const roadshows = await Roadshow.find(filter)
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
        const roadshow = await Roadshow.findById(req.params.id);

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
        const { topic, details, posted_date, deleted_date } = req.body;

        // Check required fields - accept posted_date from frontend
        const requiredFields = ['topic', 'details', 'posted_date'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
                'Missing required fields',
                { missingFields }
            );
        }

        // Validate posted date
        const postedDate = new Date(posted_date);
        if (isNaN(postedDate.getTime())) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_DATE_INVALID,
                'Invalid posted date format'
            );
        }

        // Map posted_date to event_date for backward compatibility AND set posted_date as Date object
        req.body.event_date = postedDate;
        req.body.posted_date = postedDate;

        // Validate deleted date if provided
        if (deleted_date) {
            const deletedDate = new Date(deleted_date);
            if (isNaN(deletedDate.getTime())) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_DATE_INVALID,
                    'Invalid deleted date format'
                );
            }
            req.body.deleted_date = deletedDate;
        }

        // Handle file uploads
        if (req.files) {
            if (req.files.poster) {
                req.body.poster_path = '/' + req.files.poster[0].path.replace(/\\/g, '/').replace(/^\/+/, '');
            }
            if (req.files.activity_image) {
                // Store all activity images as an array
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

        // Create notification
        await Notification.create({
            requested_by: req.user._id,
            requested_by_name: req.user.name,
            action: 'Add',
            establishment_name: roadshow.topic,
            establishment_id: roadshow._id,
            establishment_type: 'Roadshow'
        });

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

        // Handle date fields - map posted_date to event_date for backward compatibility
        if (req.body.posted_date) {
            const postedDate = new Date(req.body.posted_date);
            if (isNaN(postedDate.getTime())) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_DATE_INVALID,
                    'Invalid posted date format'
                );
            }
            req.body.event_date = postedDate;
            req.body.posted_date = postedDate;
        }

        // Validate deleted date if provided
        if (req.body.deleted_date) {
            const deletedDate = new Date(req.body.deleted_date);
            if (isNaN(deletedDate.getTime())) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_DATE_INVALID,
                    'Invalid deleted date format'
                );
            }
        } else if (req.body.deleted_date === '') {
            // Allow clearing deleted_date by sending empty string
            req.body.deleted_date = null;
        }

        // Validate event date if provided (backward compatibility)
        if (req.body.event_date) {
            const eventDate = new Date(req.body.event_date);
            if (isNaN(eventDate.getTime())) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_DATE_INVALID,
                    'Invalid event date format'
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
                // Delete old activity images if replacing
                if (roadshow.activity_image_paths && roadshow.activity_image_paths.length > 0) {
                    roadshow.activity_image_paths.forEach(imagePath => {
                        deleteStoredFile(imagePath, 'old roadshow activity image');
                    });
                }
                // Store all new activity images
                req.body.activity_image_paths = req.files.activity_image.map(file =>
                    '/' + file.path.replace(/\\/g, '/').replace(/^\/+/, '')
                );
            }
        }

        // Handle activity image deletion if requested
        if (req.body.delete_activity_image === 'true') {
            if (roadshow.activity_image_paths && roadshow.activity_image_paths.length > 0) {
                roadshow.activity_image_paths.forEach(imagePath => {
                    deleteStoredFile(imagePath, 'roadshow activity image');
                });
            }
            req.body.activity_image_paths = [];
            delete req.body.delete_activity_image; // Remove this field from update
        }

        // Handle deletion of specific activity images (for editing individual images)
        if (req.body.delete_activity_image_indices) {
            try {
                const indices = JSON.parse(req.body.delete_activity_image_indices);
                if (Array.isArray(indices) && roadshow.activity_image_paths) {
                    // Delete files
                    indices.sort((a, b) => b - a).forEach(index => {
                        if (index >= 0 && index < roadshow.activity_image_paths.length) {
                            deleteStoredFile(roadshow.activity_image_paths[index], 'roadshow activity image');
                        }
                    });
                    // Remove from array
                    req.body.activity_image_paths = roadshow.activity_image_paths.filter(
                        (_, index) => !indices.includes(index)
                    );
                }
            } catch (err) {
                console.warn('Invalid delete_activity_image_indices format');
            }
            delete req.body.delete_activity_image_indices;
        }

        // Convert is_public from string to boolean (FormData always sends strings)
        if (typeof req.body.is_public === 'string') {
            req.body.is_public = req.body.is_public === 'true' || req.body.is_public === '1';
        }

        const updatedRoadshow = await Roadshow.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // Create notification
        await Notification.create({
            requested_by: req.user._id,
            requested_by_name: req.user.name,
            action: 'Edit',
            establishment_name: updatedRoadshow.topic,
            establishment_id: updatedRoadshow._id,
            establishment_type: 'Roadshow'
        });

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

        if (roadshow.activity_image_path) {
            deleteStoredFile(roadshow.activity_image_path, 'roadshow activity image');
        }

        // Create notification before deletion
        await Notification.create({
            requested_by: req.user._id,
            requested_by_name: req.user.name,
            action: 'Delete',
            establishment_name: roadshow.topic,
            establishment_id: roadshow._id,
            establishment_type: 'Roadshow'
        });

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