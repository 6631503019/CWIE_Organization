const Roadshow = require('../models/Roadshow');
const InternshipRecord = require('../models/InternshipRecord');
const {
    CustomError,
    createNotFoundError,
    ERROR_CODES
} = require('../utils/customError');
const fs = require('fs');
const path = require('path');
const { resolveStoredPath } = require('../utils/fileCleanup');
const { normalizeRoadshowTime } = require('../utils/roadshowTime');

const {
    uploadRoadshowImageToGridFS,
    openGridFSFile,
    deleteGridFSFile
} = require('../config/gridfs');

// @desc    Get all roadshows
// @route   GET /api/roadshows
// @access  Public
const getRoadshows = async (req, res, next) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
        const skip = (page - 1) * limit;

        const filter = req.query.public !== 'false'
            ? { is_public: true }
            : {};

        if (req.query.upcoming === 'true') {
            filter.event_date = { $gte: new Date() };
        }

        const roadshows = await Roadshow.find(filter)
            .populate(
                'organization_id',
                'organization_name_en organization_name_th'
            )
            .sort({ event_date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Roadshow.countDocuments(filter);
        const pages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            message: 'Roadshows retrieved successfully',
            data: roadshows,
            pagination: {
                page,
                pages,
                total,
                hasNext: page < pages,
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
            .populate(
                'organization_id',
                'organization_name_en organization_name_th'
            );

        if (!roadshow) {
            throw createNotFoundError('roadshow', req.params.id);
        }

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
    const uploadedPosterId = null;
    const uploadedActivityIds = [];

    try {
        const {
            event_date,
            organization_id
        } = req.body;

        // Validate required fields.
        const requiredFields = [
            'topic',
            'details',
            'event_date',
            'posted_date'
        ];

        const missingFields = requiredFields.filter(
            field =>
                req.body[field] === undefined ||
                req.body[field] === null ||
                String(req.body[field]).trim() === ''
        );

        if (missingFields.length > 0) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
                'Missing required fields',
                { missingFields }
            );
        }

        // Normalize text fields.
        if (req.body.organization !== undefined) {
            req.body.organization = String(req.body.organization).trim();
        }

        [
            'organization_en',
            'organization_th',
            'title_en',
            'title_th'
        ].forEach(field => {
            if (req.body[field] !== undefined) {
                req.body[field] = String(req.body[field]).trim();
            }
        });

        // Validate organization reference.
        if (organization_id) {
            const organization = await InternshipRecord.findOne({
                _id: organization_id,
                record_type: 'organization'
            });

            if (!organization) {
                throw createNotFoundError('organization', organization_id);
            }
        }

        // Validate and normalize time.
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

        // Validate event date.
        const eventDate = new Date(event_date);

        if (isNaN(eventDate.getTime())) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_DATE_INVALID,
                'Invalid event date format'
            );
        }

        if (eventDate < new Date()) {
            console.warn('[Roadshow] Warning: Event date is in the past');
        }

        // Convert FormData boolean.
        if (typeof req.body.is_public === 'string') {
            req.body.is_public =
                req.body.is_public === 'true' ||
                req.body.is_public === '1';
        }

        // Upload poster to GridFS.
        if (req.files?.poster?.length) {
            const posterId = await uploadRoadshowImageToGridFS(
                req.files.poster[0],
                { kind: 'poster' }
            );

            // Keep track of uploaded files for cleanup.
            uploadedActivityIds.push(...[]);
            req.body.poster_gridfs_id = posterId;
            req.body.poster_path = null;

            // Store the ID for cleanup if database creation fails.
            req._uploadedRoadshowPosterId = posterId;
        }

        // Upload activity images to GridFS.
        if (req.files?.activity_image?.length) {
            req.body.activity_gridfs_ids = [];

            for (const file of req.files.activity_image) {
                const id = await uploadRoadshowImageToGridFS(
                    file,
                    { kind: 'activity' }
                );

                req.body.activity_gridfs_ids.push(id);
                uploadedActivityIds.push(id);
            }

            req.body.activity_image_paths = [];
        }

        // Add authenticated admin ID.
        req.body.admin_id = req.user._id;

        // Create MongoDB document.
        const roadshow = await Roadshow.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Roadshow created successfully',
            data: roadshow
        });
    } catch (error) {
        // Clean up newly uploaded files if creation fails.
        const posterId = req._uploadedRoadshowPosterId;

        if (posterId) {
            await deleteGridFSFile(
                posterId,
                'roadshowFiles'
            ).catch(cleanupError => {
                console.error(
                    '[Roadshow] Poster cleanup failed:',
                    cleanupError.message
                );
            });
        }

        if (uploadedActivityIds.length > 0) {
            await Promise.all(
                uploadedActivityIds.map(id =>
                    deleteGridFSFile(id, 'roadshowFiles').catch(cleanupError => {
                        console.error(
                            '[Roadshow] Activity image cleanup failed:',
                            id,
                            cleanupError.message
                        );
                    })
                )
            );
        }

        next(error);
    }
};

// @desc    Update roadshow
// @route   PUT /api/roadshows/:id
// @access  Private (Admin)
const updateRoadshow = async (req, res, next) => {
    let newPosterGridfsId = null;
    const newlyUploadedActivityIds = [];

    try {
        const roadshow = await Roadshow.findById(req.params.id);

        if (!roadshow) {
            throw createNotFoundError('roadshow', req.params.id);
        }

        // Normalize text fields.
        if (req.body.organization !== undefined) {
            req.body.organization = String(req.body.organization).trim();
        }

        [
            'organization_en',
            'organization_th',
            'title_en',
            'title_th'
        ].forEach(field => {
            if (req.body[field] !== undefined) {
                req.body[field] = String(req.body[field]).trim();
            }
        });

        // Validate organization.
        if (req.body.organization_id) {
            const organization = await InternshipRecord.findOne({
                _id: req.body.organization_id,
                record_type: 'organization'
            });

            if (!organization) {
                throw createNotFoundError(
                    'organization',
                    req.body.organization_id
                );
            }
        }

        // Validate event date.
        if (req.body.event_date) {
            const eventDate = new Date(req.body.event_date);

            if (isNaN(eventDate.getTime())) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_DATE_INVALID,
                    'Invalid event date format'
                );
            }
        }

        // Normalize time.
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

        // Convert FormData boolean.
        if (typeof req.body.is_public === 'string') {
            req.body.is_public =
                req.body.is_public === 'true' ||
                req.body.is_public === '1';
        }

        // Do not allow clients to directly overwrite GridFS references.
        delete req.body.poster_gridfs_id;
        delete req.body.activity_gridfs_ids;

        // Upload new poster.
        if (req.files?.poster?.length) {
            newPosterGridfsId = await uploadRoadshowImageToGridFS(
                req.files.poster[0],
                { kind: 'poster' }
            );

            req.body.poster_gridfs_id = newPosterGridfsId;
            req.body.poster_path = null;
        }

        // Upload replacement activity images.
        // If no new images are uploaded, existing images remain unchanged.
        if (req.files?.activity_image?.length) {
            const newActivityIds = [];

            for (const file of req.files.activity_image) {
                const id = await uploadRoadshowImageToGridFS(
                    file,
                    { kind: 'activity' }
                );

                newActivityIds.push(id);
                newlyUploadedActivityIds.push(id);
            }

            req.body.activity_gridfs_ids = newActivityIds;
            req.body.activity_image_paths = [];
        }

        // Handle deletion of selected activity images.
        const removedGridfsIds = [];

        if (
            !req.files?.activity_image?.length &&
            req.body.delete_activity_image_indices !== undefined
        ) {
            let deleteIndices;

            try {
                deleteIndices = JSON.parse(
                    req.body.delete_activity_image_indices
                );
            } catch (error) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_INVALID_FORMAT,
                    'Invalid activity image deletion indices'
                );
            }

            if (!Array.isArray(deleteIndices)) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_INVALID_FORMAT,
                    'Activity image deletion indices must be an array'
                );
            }

            const indexSet = new Set(
                deleteIndices
                    .map(Number)
                    .filter(index =>
                        Number.isInteger(index) && index >= 0
                    )
            );

            const existingGridfsIds = Array.isArray(
                roadshow.activity_gridfs_ids
            )
                ? roadshow.activity_gridfs_ids
                : [];

            const existingLegacyPaths = Array.isArray(
                roadshow.activity_image_paths
            )
                ? roadshow.activity_image_paths
                : [];

            req.body.activity_gridfs_ids = existingGridfsIds.filter(
                (_, index) => !indexSet.has(index)
            );

            req.body.activity_image_paths = existingLegacyPaths.filter(
                (_, index) => !indexSet.has(index)
            );

            existingGridfsIds.forEach((id, index) => {
                if (indexSet.has(index)) {
                    removedGridfsIds.push(id);
                }
            });
        }

        delete req.body.delete_activity_image_indices;

        // Update MongoDB before deleting old GridFS files.
        const updatedRoadshow = await Roadshow.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate(
            'organization_id',
            'organization_name_en organization_name_th'
        );

        if (!updatedRoadshow) {
            throw createNotFoundError('roadshow', req.params.id);
        }

        // Database update succeeded. Clean up replaced poster.
        if (newPosterGridfsId && roadshow.poster_gridfs_id) {
            await deleteGridFSFile(
                roadshow.poster_gridfs_id,
                'roadshowFiles'
            ).catch(error => {
                console.error(
                    '[Roadshow] Failed to delete old poster:',
                    error.message
                );
            });
        }

        // If new activity images replaced the old set, delete old GridFS images.
        if (req.files?.activity_image?.length) {
            const oldActivityIds = Array.isArray(
                roadshow.activity_gridfs_ids
            )
                ? roadshow.activity_gridfs_ids
                : [];

            await Promise.all(
                oldActivityIds.map(id =>
                    deleteGridFSFile(id, 'roadshowFiles').catch(error => {
                        console.error(
                            '[Roadshow] Failed to delete old activity image:',
                            id,
                            error.message
                        );
                    })
                )
            );
        } else if (removedGridfsIds.length > 0) {
            // Delete only selected activity images.
            await Promise.all(
                removedGridfsIds.map(id =>
                    deleteGridFSFile(id, 'roadshowFiles').catch(error => {
                        console.error(
                            '[Roadshow] Failed to delete removed activity image:',
                            id,
                            error.message
                        );
                    })
                )
            );
        }

        return res.status(200).json({
            success: true,
            message: 'Roadshow updated successfully',
            data: updatedRoadshow
        });

    } catch (error) {
        // Update failed. Delete only newly uploaded files.
        // Existing files must remain because MongoDB may still reference them.

        if (newPosterGridfsId) {
            await deleteGridFSFile(
                newPosterGridfsId,
                'roadshowFiles'
            ).catch(cleanupError => {
                console.error(
                    '[Roadshow] Failed to clean up new poster:',
                    cleanupError.message
                );
            });
        }

        if (newlyUploadedActivityIds.length > 0) {
            await Promise.all(
                newlyUploadedActivityIds.map(id =>
                    deleteGridFSFile(id, 'roadshowFiles').catch(cleanupError => {
                        console.error(
                            '[Roadshow] Failed to clean up new activity image:',
                            id,
                            cleanupError.message
                        );
                    })
                )
            );
        }

        return next(error);
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

        // Delete the MongoDB document first.
        const deletedRoadshow = await Roadshow.findByIdAndDelete(
            req.params.id
        );

        if (!deletedRoadshow) {
            throw createNotFoundError('roadshow', req.params.id);
        }

        // Clean up GridFS files after document deletion.
        if (roadshow.poster_gridfs_id) {
            await deleteGridFSFile(
                roadshow.poster_gridfs_id,
                'roadshowFiles'
            ).catch(error => {
                console.error(
                    '[Roadshow] Failed to delete poster:',
                    error.message
                );
            });
        }

        if (Array.isArray(roadshow.activity_gridfs_ids)) {
            await Promise.all(
                roadshow.activity_gridfs_ids.map(id =>
                    deleteGridFSFile(id, 'roadshowFiles').catch(error => {
                        console.error(
                            '[Roadshow] Failed to delete activity image:',
                            id,
                            error.message
                        );
                    })
                )
            );
        }

        res.status(200).json({
            success: true,
            message: 'Roadshow deleted successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// Stream GridFS or legacy image.
const getImageContentType = filePath => {
    const extension = path.extname(String(filePath || '')).toLowerCase();
    const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };
    return contentTypes[extension] || 'application/octet-stream';
};

const streamRoadshowImage = async (
    req,
    res,
    gridfsId,
    legacyPath,
    kind
) => {
    const roadshow = await Roadshow.findById(req.params.id);

    if (!roadshow) {
        throw createNotFoundError('roadshow', req.params.id);
    }

    if (!roadshow.is_public && req.user?.role !== 'admin') {
        throw new CustomError(
            ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS_DENIED,
            'This roadshow is private',
            { roadshowId: req.params.id }
        );
    }

    // Prefer GridFS.
    if (gridfsId) {
        try {
            const gridfs = await openGridFSFile(
                gridfsId,
                'roadshowFiles'
            );

            res.setHeader(
                'Content-Type',
                gridfs.file.contentType || 'application/octet-stream'
            );

            res.setHeader(
                'Content-Length',
                gridfs.file.length
            );

            res.setHeader(
                'Cache-Control',
                'private, max-age=300'
            );

            res.setHeader(
                'X-Content-Type-Options',
                'nosniff'
            );

            gridfs.stream.on('error', error => {
                console.error(
                    '[Roadshow] GridFS stream error:',
                    error.message
                );

                if (!res.headersSent) {
                    res.status(500).end();
                } else {
                    res.destroy(error);
                }
            });

            gridfs.stream.pipe(res);
            return;
        } catch (error) {
            if (error.code === 'DATABASE_UNAVAILABLE') {
                throw new CustomError(
                    ERROR_CODES.SERVICE_DATABASE_UNAVAILABLE,
                    'Roadshow image storage is temporarily unavailable'
                );
            }

            if (error.code === 'GRIDFS_FILE_NOT_FOUND') {
                throw createNotFoundError('file', req.params.id);
            }

            console.error(
                '[Roadshow] Unable to open GridFS image:',
                error.message
            );

            throw new CustomError(
                ERROR_CODES.SERVICE_DATABASE_UNAVAILABLE,
                'Roadshow image storage is temporarily unavailable'
            );
        }
    }

    // Fallback to legacy local storage.
    if (legacyPath) {
        const absolutePath = resolveStoredPath(legacyPath);

        if (absolutePath && fs.existsSync(absolutePath)) {
            const stat = fs.statSync(absolutePath);

            res.setHeader(
                'Content-Type',
                getImageContentType(absolutePath)
            );

            res.setHeader(
                'Content-Length',
                stat.size
            );

            res.setHeader(
                'Cache-Control',
                'private, max-age=300'
            );

            res.setHeader(
                'X-Content-Type-Options',
                'nosniff'
            );

            const fileStream = fs.createReadStream(absolutePath);

            fileStream.on('error', error => {
                console.error(
                    '[Roadshow] Legacy image stream error:',
                    error.message
                );

                if (!res.headersSent) {
                    res.status(500).end();
                } else {
                    res.destroy(error);
                }
            });

            fileStream.pipe(res);
            return;
        }
    }

    throw createNotFoundError('file', req.params.id);
};

// @desc    Get roadshow poster
// @route   GET /api/roadshows/:id/poster
// @access  Public / Admin for private roadshows
const getRoadshowPoster = async (req, res, next) => {
    try {
        const roadshow = await Roadshow.findById(req.params.id);

        if (!roadshow) {
            throw createNotFoundError('roadshow', req.params.id);
        }

        await streamRoadshowImage(
            req,
            res,
            roadshow.poster_gridfs_id,
            roadshow.poster_path,
            'poster'
        );
    } catch (error) {
        if (!res.headersSent) {
            next(error);
        } else {
            res.destroy(error);
        }
    }
};

// @desc    Get roadshow activity image
// @route   GET /api/roadshows/:id/activity/:index
// @access  Public / Admin for private roadshows
const getRoadshowActivityImage = async (req, res, next) => {
    try {
        const roadshow = await Roadshow.findById(req.params.id);

        if (!roadshow) {
            throw createNotFoundError('roadshow', req.params.id);
        }

        const index = Number(req.params.index);

        if (!Number.isInteger(index) || index < 0) {
            throw createNotFoundError('file', req.params.id);
        }

        const gridfsId = Array.isArray(roadshow.activity_gridfs_ids)
            ? roadshow.activity_gridfs_ids[index]
            : null;

        const legacyPath = Array.isArray(roadshow.activity_image_paths)
            ? roadshow.activity_image_paths[index]
            : null;

        if (!gridfsId && !legacyPath) {
            throw createNotFoundError('file', req.params.id);
        }

        await streamRoadshowImage(
            req,
            res,
            gridfsId,
            legacyPath,
            'activity'
        );
    } catch (error) {
        if (!res.headersSent) {
            next(error);
        } else {
            res.destroy(error);
        }
    }
};

module.exports = {
    getRoadshows,
    getRoadshow,
    createRoadshow,
    updateRoadshow,
    deleteRoadshow,
    getRoadshowPoster,
    getRoadshowActivityImage
};
