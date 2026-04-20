const MOU = require('../models/MOU');
const Organization = require('../models/Organization');
const { CustomError, createNotFoundError, ERROR_CODES } = require('../utils/customError');
const { deleteStoredFile } = require('../utils/fileCleanup');

// @desc    Get all MOUs
// @route   GET /api/mou
// @access  Public
const getMOUs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter based on published parameter
        let filter = {};
        if (req.query.published === 'true') {
            filter.is_published = true;
        } else if (req.query.published === 'false') {
            filter.is_published = false;
        }
        // If published not specified or 'all', show all MOUs

        const mous = await MOU.find(filter)
            .populate('organization_id', 'name_en name_th logo_path')
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
            .populate('organization_id', 'name_en name_th logo_path email');

        if (!mou) {
            throw createNotFoundError('mou', req.params.id);
        }

        // Check if MOU is published or user has permission
        if (!mou.is_published && (!req.user || req.user.role !== 'admin')) {
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

        // Check required fields
        if (!organization_id) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
                'Organization ID is required'
            );
        }

        // Check if organization exists
        const organization = await Organization.findById(organization_id);
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

        // Check if MOU already exists for this organization
        const existingMOU = await MOU.findOne({ organization_id });
        if (existingMOU) {
            // Update existing MOU instead of throwing error
            console.log('MOU already exists, updating instead:', existingMOU._id);

            // Delete old MOU file if a new file is uploaded
            if (req.file && existingMOU.mou_file_path) {
                deleteStoredFile(existingMOU.mou_file_path, 'old MOU file');
            }

            req.body.mou_file_path = req.file.path;
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

            console.log('CREATE - Updated MOU:', updatedMOU._id, 'is_published:', updatedMOU.is_published);

            return res.status(200).json({
                success: true,
                message: 'MOU updated successfully',
                data: updatedMOU
            });
        }

        req.body.mou_file_path = req.file.path;

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

        // Validate and convert start_date if provided
        if (req.body.start_date) {
            const startDate = new Date(req.body.start_date);
            if (isNaN(startDate.getTime())) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_DATE_INVALID,
                    'Invalid start date format'
                );
            }
            req.body.start_date = startDate;
        }

        // Validate and convert end_date if provided
        if (req.body.end_date) {
            const endDate = new Date(req.body.end_date);
            if (isNaN(endDate.getTime())) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_DATE_INVALID,
                    'Invalid end date format'
                );
            }
            req.body.end_date = endDate;
        }

        const mou = await MOU.create(req.body);

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

        // Validate and convert start_date if provided
        if (req.body.start_date) {
            const startDate = new Date(req.body.start_date);
            if (isNaN(startDate.getTime())) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_DATE_INVALID,
                    'Invalid start date format'
                );
            }
            req.body.start_date = startDate;
        }

        // Validate and convert end_date if provided
        if (req.body.end_date) {
            const endDate = new Date(req.body.end_date);
            if (isNaN(endDate.getTime())) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_DATE_INVALID,
                    'Invalid end date format'
                );
            }
            req.body.end_date = endDate;
        }

        if (req.file) {
            // Validate file type (should be PDF)
            if (req.file.mimetype !== 'application/pdf') {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_FILE_TYPE_INVALID,
                    'MOU file must be PDF format',
                    { receivedType: req.file.mimetype }
                );
            }

            // Delete old MOU file if exists
            if (mou.mou_file_path) {
                deleteStoredFile(mou.mou_file_path, 'old MOU file');
            }

            req.body.mou_file_path = req.file.path;
        }

        const updatedMOU = await MOU.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

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
            deleteStoredFile(mou.mou_file_path, 'MOU file');
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

module.exports = {
    getMOUs,
    getMOU,
    createMOU,
    updateMOU,
    deleteMOU
};