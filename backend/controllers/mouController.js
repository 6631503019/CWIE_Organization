const MOU = require('../models/MOU');
const Organization = require('../models/Organization');
const { CustomError, createNotFoundError, ERROR_CODES } = require('../utils/customError');

// @desc    Get all MOUs
// @route   GET /api/mou
// @access  Public
const getMOUs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = req.query.published !== 'false' ? { is_published: true } : {};

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
            throw new CustomError(
                ERROR_CODES.CONFLICT_MOU_ALREADY_SIGNED,
                'MOU already exists for this organization',
                { organizationId: organization_id }
            );
        }

        req.body.mou_file_path = req.file.path;

        const mou = await MOU.create(req.body);

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

        if (!mou) {
            throw createNotFoundError('mou', req.params.id);
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
            req.body.mou_file_path = req.file.path;
        }

        const updatedMOU = await MOU.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

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