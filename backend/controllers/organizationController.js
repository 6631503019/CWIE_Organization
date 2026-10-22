const InternshipRecord = require('../models/InternshipRecord');
const { CustomError, createNotFoundError, ERROR_CODES } = require('../utils/customError');
const { deleteStoredFile } = require('../utils/fileCleanup');
const {
    getOrganizationKey,
    toOrganizationRecord,
    toOrganizationResponse
} = require('../utils/organizationRecord');

const ORGANIZATION_FILTER = { record_type: 'organization' };
const VALID_TYPES = ['MFU', 'private company', 'Government', 'Oversea'];

const getOrganizations = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1 || limit > 10000) {
            throw new CustomError(ERROR_CODES.VALIDATION_INVALID_RANGE, 'Invalid pagination parameters');
        }

        const filter = { ...ORGANIZATION_FILTER };
        if (req.query.public !== 'false') filter.is_public = true;
        if (req.query.type) filter.organization_type = req.query.type;
        if (req.query.search) {
            const search = new RegExp(req.query.search, 'i');
            filter.$or = [
                { organization_name_th: search },
                { organization_name_en: search },
                { organization_email: search }
            ];
        }

        const [records, total] = await Promise.all([
            InternshipRecord.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            InternshipRecord.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            message: 'Organizations retrieved successfully',
            data: records.map(toOrganizationResponse),
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

const getOrganization = async (req, res, next) => {
    try {
        const organization = await InternshipRecord.findOne({
            _id: req.params.id,
            ...ORGANIZATION_FILTER
        });
        if (!organization) throw createNotFoundError('organization', req.params.id);
        if (!organization.is_public && (!req.user || req.user.role !== 'admin')) {
            throw new CustomError(ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS_DENIED, 'This organization is private');
        }
        res.status(200).json({
            success: true,
            message: 'Organization retrieved successfully',
            data: toOrganizationResponse(organization)
        });
    } catch (error) {
        next(error);
    }
};

const validateOrganizationBody = body => {
    const required = ['name_th', 'name_en', 'email', 'organization_type'];
    const missing = required.filter(field => !body[field]);
    if (missing.length) {
        throw new CustomError(ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD, 'Missing required fields', { missingFields: missing });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        throw new CustomError(ERROR_CODES.VALIDATION_EMAIL_INVALID, 'Invalid email format');
    }
    if (!VALID_TYPES.includes(body.organization_type)) {
        throw new CustomError(ERROR_CODES.VALIDATION_INVALID_TYPE, 'Invalid organization type', { allowedValues: VALID_TYPES });
    }
};

const normalizeBoolean = value => {
    if (typeof value !== 'string') return value;
    return value === 'true' || value === '1';
};

const createOrganization = async (req, res, next) => {
    try {
        validateOrganizationBody(req.body);
        const organizationKey = getOrganizationKey(req.body.name_th, req.body.name_en);
        const existing = await InternshipRecord.findOne({ record_type: 'organization', organization_key: organizationKey });
        if (existing) {
            throw new CustomError(ERROR_CODES.CONFLICT_ORGANIZATION_ALREADY_EXISTS, 'Organization already exists');
        }

        if (req.file) {
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(req.file.mimetype)) {
                throw new CustomError(ERROR_CODES.VALIDATION_FILE_TYPE_INVALID, 'Logo must be JPEG, PNG, or GIF');
            }
            req.body.logo_path = `/${req.file.path.replace(/\\/g, '/').replace(/^\/+/, '')}`;
        }
        req.body.is_public = normalizeBoolean(req.body.is_public);
        const organization = await InternshipRecord.create(toOrganizationRecord(req.body, req.user._id));

        res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            data: toOrganizationResponse(organization)
        });
    } catch (error) {
        next(error);
    }
};

const updateOrganization = async (req, res, next) => {
    try {
        const existing = await InternshipRecord.findOne({ _id: req.params.id, ...ORGANIZATION_FILTER });
        if (!existing) throw createNotFoundError('organization', req.params.id);

        if (req.body.email && req.body.email !== existing.organization_email) {
            const emailExists = await InternshipRecord.findOne({
                ...ORGANIZATION_FILTER,
                organization_email: req.body.email,
                _id: { $ne: req.params.id }
            });
            if (emailExists) throw new CustomError(ERROR_CODES.VALIDATION_EMAIL_DUPLICATE, 'Email already in use');
        }
        if (req.body.organization_type && !VALID_TYPES.includes(req.body.organization_type)) {
            throw new CustomError(ERROR_CODES.VALIDATION_INVALID_TYPE, 'Invalid organization type');
        }
        if (req.file) {
            if (existing.logo_path) deleteStoredFile(existing.logo_path, 'old logo file');
            req.body.logo_path = `/${req.file.path.replace(/\\/g, '/').replace(/^\/+/, '')}`;
        }
        req.body.is_public = normalizeBoolean(req.body.is_public);
        const organization = await InternshipRecord.findByIdAndUpdate(
            req.params.id,
            toOrganizationRecord(req.body, existing.admin_id, existing),
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Organization updated successfully',
            data: toOrganizationResponse(organization)
        });
    } catch (error) {
        next(error);
    }
};

const deleteOrganization = async (req, res, next) => {
    try {
        const organization = await InternshipRecord.findOne({ _id: req.params.id, ...ORGANIZATION_FILTER });
        if (!organization) throw createNotFoundError('organization', req.params.id);
        if (organization.logo_path) deleteStoredFile(organization.logo_path, 'logo file');
        await InternshipRecord.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Organization deleted successfully', data: null });
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
