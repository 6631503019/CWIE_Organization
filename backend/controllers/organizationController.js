const Organization = require('../models/Organization');
const { CustomError, createNotFoundError, ERROR_CODES } = require('../utils/customError');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Public
const getOrganizations = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 10000) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_INVALID_RANGE,
                'Invalid pagination parameters. Page must be >= 1 and limit between 1-10000'
            );
        }

        const filter = req.query.public !== 'false' ? { is_public: true } : {};

        if (req.query.type) {
            const validTypes = ['government', 'private', 'ngo', 'education', 'other'];
            if (!validTypes.includes(req.query.type)) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_INVALID_TYPE,
                    'Invalid organization type',
                    { allowedTypes: validTypes }
                );
            }
            filter.organization_type = req.query.type;
        }

        // Search functionality
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filter.$or = [
                { name_th: searchRegex },
                { name_en: searchRegex },
                { email: searchRegex }
            ];
        }

        const organizations = await Organization.find(filter)
            .populate('industry_category_id', 'name')
            .populate('country_id', 'name')
            .populate('geography_id', 'name')
            .populate('province_id', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Organization.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Organizations retrieved successfully',
            data: organizations,
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

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Public
const getOrganization = async (req, res, next) => {
    try {
        const organization = await Organization.findById(req.params.id)
            .populate('industry_category_id', 'name')
            .populate('country_id', 'name')
            .populate('geography_id', 'name')
            .populate('province_id', 'name');

        if (!organization) {
            throw createNotFoundError('organization', req.params.id);
        }

        // Check if organization is public or user has permission
        if (!organization.is_public && (!req.user || req.user.role !== 'admin')) {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS_DENIED,
                'This organization is private',
                { organizationId: req.params.id }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Organization retrieved successfully',
            data: organization
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create organization
// @route   POST /api/organizations
// @access  Private (Admin)
const createOrganization = async (req, res, next) => {
    try {
        // Check required fields
        const requiredFields = ['name_th', 'name_en', 'email', 'organization_type'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
                'Missing required fields',
                { missingFields }
            );
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(req.body.email)) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_EMAIL_INVALID,
                'Invalid email format',
                { field: 'email', value: req.body.email }
            );
        }

        // Check if organization exists
        const existingOrg = await Organization.findOne({ email: req.body.email });
        if (existingOrg) {
            throw new CustomError(
                ERROR_CODES.CONFLICT_ORGANIZATION_ALREADY_EXISTS,
                'Organization with this email already exists',
                { email: req.body.email }
            );
        }

        // Validate organization type
        const validTypes = ['government', 'private', 'ngo', 'education', 'other'];
        if (!validTypes.includes(req.body.organization_type)) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_INVALID_TYPE,
                'Invalid organization type',
                {
                    field: 'organization_type',
                    value: req.body.organization_type,
                    allowedValues: validTypes
                }
            );
        }

        if (req.file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_FILE_TYPE_INVALID,
                    'Logo must be JPEG, PNG, or GIF',
                    {
                        field: 'logo',
                        receivedType: req.file.mimetype,
                        allowedTypes
                    }
                );
            }

            req.body.logo_path = req.file.path;
        }

        // Add admin ID from authenticated user
        req.body.admin_id = req.user._id;

        const organization = await Organization.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            data: organization
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (Admin)
const updateOrganization = async (req, res, next) => {
    try {
        // Check if organization exists
        const existingOrg = await Organization.findById(req.params.id);
        if (!existingOrg) {
            throw createNotFoundError('organization', req.params.id);
        }

        // Check email uniqueness if email is being updated
        if (req.body.email && req.body.email !== existingOrg.email) {
            const emailExists = await Organization.findOne({
                email: req.body.email,
                _id: { $ne: req.params.id }
            });

            if (emailExists) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_EMAIL_DUPLICATE,
                    'Email already in use by another organization',
                    { email: req.body.email }
                );
            }
        }

        // Validate organization type if provided
        if (req.body.organization_type) {
            const validTypes = ['government', 'private', 'ngo', 'education', 'other'];
            if (!validTypes.includes(req.body.organization_type)) {
                throw new CustomError(
                    ERROR_CODES.VALIDATION_INVALID_TYPE,
                    'Invalid organization type',
                    {
                        field: 'organization_type',
                        value: req.body.organization_type,
                        allowedValues: validTypes
                    }
                );
            }
        }

        if (req.file) {
            req.body.logo_path = req.file.path;
        }

        const organization = await Organization.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Organization updated successfully',
            data: organization
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private (Admin)
const deleteOrganization = async (req, res, next) => {
    try {
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            throw createNotFoundError('organization', req.params.id);
        }

        await Organization.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Organization deleted successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization
};