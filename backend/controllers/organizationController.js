const InternshipRecord = require('../models/InternshipRecord');
const { CustomError, createNotFoundError, ERROR_CODES } = require('../utils/customError');
const { deleteStoredFile } = require('../utils/fileCleanup');
const { getPublicUploadPath } = require('../config/uploads');
const fs = require('fs');
const { uploadOrganizationLogoToGridFS, openGridFSFile, deleteGridFSFile } = require('../config/gridfs');
const {
    getOrganizationKey,
    toOrganizationRecord,
    toOrganizationResponse
} = require('../utils/organizationRecord');

const ORGANIZATION_FILTER = { record_type: 'organization' };
const VALID_TYPES = ['MFU', 'private company', 'Government', 'Oversea'];
const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getOrganizations = async (req, res, next) => {
    const startedAt = process.hrtime.bigint();
    try {
        if (req.query.public === 'false' && req.user?.role !== 'admin') {
            throw new CustomError(
                ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS_DENIED,
                'Administrator access is required to view private organizations'
            );
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1 || limit > 100) {
            throw new CustomError(ERROR_CODES.VALIDATION_INVALID_RANGE, 'Invalid pagination parameters');
        }

        const filter = { ...ORGANIZATION_FILTER };
        const arr_And_Conditions = [];
        if (req.query.public !== 'false') filter.is_public = true;
        if (req.query.type) {
            const type = new RegExp(escapeRegex(String(req.query.type)), 'i');
            arr_And_Conditions.push({
                $or: [
                    { organization_type: type },
                    { business_type_en: type },
                    { business_type_th: type }
                ]
            });
        }
        if (req.query.country) {
            arr_And_Conditions.push({
                $or: [
                    { country_id: new RegExp(escapeRegex(String(req.query.country)), 'i') },
                    { country_en: new RegExp(escapeRegex(String(req.query.country)), 'i') },
                    { country_th: new RegExp(escapeRegex(String(req.query.country)), 'i') }
                ]
            });
        }
        if (req.query.geography) filter.geography_id = new RegExp(req.query.geography, 'i');
        if (req.query.province) {
            arr_And_Conditions.push({
                $or: [
                    { province_id: new RegExp(req.query.province, 'i') },
                    { province_en: new RegExp(req.query.province, 'i') },
                    { province_th: new RegExp(req.query.province, 'i') }
                ]
            });
        }
        if (req.query.industry) {
            arr_And_Conditions.push({
                $or: [
                    { industry_category_id: new RegExp(req.query.industry, 'i') },
                    { organization_name_en: new RegExp(req.query.industry, 'i') },
                    { organization_name_th: new RegExp(req.query.industry, 'i') }
                ]
            });
        }
        if (req.query.school) {
            arr_And_Conditions.push({
                $or: [
                    { school_en: new RegExp(req.query.school, 'i') },
                    { school_th: new RegExp(req.query.school, 'i') }
                ]
            });
        }
        if (req.query.businessCategory) {
            const category = new RegExp(escapeRegex(String(req.query.businessCategory)), 'i');
            arr_And_Conditions.push({
                $or: [
                    { business_category_th: category },
                    { business_category_en: category }
                ]
            });
        }
        if (req.query.search) {
            const searchText = String(req.query.search).trim();
            const search = new RegExp(escapeRegex(searchText), 'i');
            const searchConditions = [
                { organization_name_th: search },
                { organization_name_en: search }
            ];
            arr_And_Conditions.push({ $or: searchConditions });
        }
        if (arr_And_Conditions.length) filter.$and = arr_And_Conditions;

        const dbStartedAt = process.hrtime.bigint();
        let records;
        let total;
        if (req.query.search) {
            const organizationSearch = String(req.query.search).trim();
            const search = new RegExp(escapeRegex(organizationSearch), 'i');
            const organizationFilter = {
                $or: [
                    { organization_name_th: search },
                    { organization_name_en: search }
                ]
            };
            organizationFilter.record_type = 'organization';
            if (req.query.public !== 'false') organizationFilter.is_public = true;
            if (req.query.type) {
                const type = new RegExp(escapeRegex(String(req.query.type)), 'i');
                organizationFilter.$and = [
                    ...(organizationFilter.$and || []),
                    { $or: [
                        { organization_type: type },
                        { business_type_en: type },
                        { business_type_th: type }
                    ] }
                ];
            }
            if (req.query.country) {
                const country = new RegExp(escapeRegex(String(req.query.country)), 'i');
                organizationFilter.$and = [
                    ...(organizationFilter.$and || []),
                    { $or: [
                        { country_id: country },
                        { country_en: country },
                        { country_th: country }
                    ] }
                ];
            }
            if (req.query.province) {
                const province = new RegExp(escapeRegex(String(req.query.province)), 'i');
                organizationFilter.$and = [
                    ...(organizationFilter.$and || []),
                    { $or: [
                        { province_id: province },
                        { province_en: province },
                        { province_th: province }
                    ] }
                ];
            }
            if (req.query.geography) {
                organizationFilter.geography_id = new RegExp(escapeRegex(String(req.query.geography)), 'i');
            }
            if (req.query.industry) {
                organizationFilter.industry_category_id = new RegExp(escapeRegex(String(req.query.industry)), 'i');
            }
            if (req.query.school) {
                organizationFilter.$and = [
                    ...(organizationFilter.$and || []),
                    { $or: [
                        { school_th: new RegExp(escapeRegex(String(req.query.school)), 'i') },
                        { school_en: new RegExp(escapeRegex(String(req.query.school)), 'i') }
                    ] }
                ];
            }
            if (req.query.businessCategory) {
                organizationFilter.$and = [
                    ...(organizationFilter.$and || []),
                    { $or: [
                        { business_category_th: new RegExp(escapeRegex(String(req.query.businessCategory)), 'i') },
                        { business_category_en: new RegExp(escapeRegex(String(req.query.businessCategory)), 'i') }
                    ] }
                ];
            }
            [records, total] = await Promise.all([
                InternshipRecord.find(organizationFilter)
                    .select('record_type organization_key organization_name_th organization_name_en address_th address_en organization_email telephone province_id province_th province_en country_id country_th country_en geography_id organization_type business_type_th business_type_en business_category_th business_category_en school_th school_en industry_category_id is_public logo_path logo_gridfs_id details admin_id createdAt updatedAt')
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean(),
                InternshipRecord.countDocuments(organizationFilter)
            ]);
        } else {
            [records, total] = await Promise.all([
                InternshipRecord.find(filter)
                    .select('record_type organization_key organization_name_th organization_name_en address_th address_en organization_email telephone province_id province_th province_en country_id country_th country_en geography_id organization_type business_type_th business_type_en business_category_th business_category_en school_th school_en industry_category_id is_public logo_path logo_gridfs_id details admin_id createdAt updatedAt')
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean(),
                InternshipRecord.countDocuments(filter)
            ]);
        }
        const dbMs = Number(process.hrtime.bigint() - dbStartedAt) / 1e6;

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
        const totalMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
        console.info('[organizations] GET', {
            page,
            limit,
            total,
            dbMs: Math.round(dbMs),
            responseMs: Math.round(totalMs),
            hasSearch: Boolean(req.query.search),
            hasFilters: Object.keys(req.query).some(key => ['type', 'country', 'geography', 'province', 'industry', 'school'].includes(key))
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
    let uploadedGridfsId = null;
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
            uploadedGridfsId = await uploadOrganizationLogoToGridFS(req.file, { kind: 'organization-logo' });
            req.body.logo_gridfs_id = uploadedGridfsId;
            req.body.logo_path = getPublicUploadPath('logos', req.file.filename);
        }
        req.body.is_public = normalizeBoolean(req.body.is_public);
        const organization = await InternshipRecord.create(toOrganizationRecord(req.body, req.user._id));

        res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            data: toOrganizationResponse(organization)
        });
    } catch (error) {
        if (uploadedGridfsId) await deleteGridFSFile(uploadedGridfsId, 'organizationLogos').catch(() => undefined);
        next(error);
    }
};

const updateOrganization = async (req, res, next) => {
    let uploadedGridfsId = null;
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
            uploadedGridfsId = await uploadOrganizationLogoToGridFS(req.file, { kind: 'organization-logo', organizationId: String(existing._id) });
            req.body.logo_gridfs_id = uploadedGridfsId;
            req.body.logo_path = getPublicUploadPath('logos', req.file.filename);
        }
        req.body.is_public = normalizeBoolean(req.body.is_public);
        const organization = await InternshipRecord.findByIdAndUpdate(
            req.params.id,
            toOrganizationRecord(req.body, existing.admin_id, existing),
            { new: true, runValidators: true }
        );
        if (req.file) {
            if (existing.logo_gridfs_id) await deleteGridFSFile(existing.logo_gridfs_id, 'organizationLogos').catch(error => console.error('Failed to remove old organization logo from GridFS', { errorName: error.name, errorCode: error.code }));
            if (existing.logo_path) deleteStoredFile(existing.logo_path, 'old logo file');
        }

        res.status(200).json({
            success: true,
            message: 'Organization updated successfully',
            data: toOrganizationResponse(organization)
        });
    } catch (error) {
        if (uploadedGridfsId) await deleteGridFSFile(uploadedGridfsId, 'organizationLogos').catch(() => undefined);
        next(error);
    }
};

const deleteOrganization = async (req, res, next) => {
    try {
        const organization = await InternshipRecord.findOne({ _id: req.params.id, ...ORGANIZATION_FILTER });
        if (!organization) throw createNotFoundError('organization', req.params.id);
        if (organization.logo_path) deleteStoredFile(organization.logo_path, 'logo file');
        if (organization.logo_gridfs_id) await deleteGridFSFile(organization.logo_gridfs_id, 'organizationLogos').catch(error => console.error('Failed to remove organization logo from GridFS', { errorName: error.name, errorCode: error.code }));
        await InternshipRecord.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Organization deleted successfully', data: null });
    } catch (error) {
        next(error);
    }
};

const getOrganizationLogo = async (req, res, next) => {
    try {
        const organization = await InternshipRecord.findOne({ _id: req.params.id, ...ORGANIZATION_FILTER });
        if (!organization) throw createNotFoundError('organization', req.params.id);
        if (!organization.logo_gridfs_id) {
            if (organization.logo_path) {
                const legacyPath = require('../utils/fileCleanup').resolveStoredPath(organization.logo_path);
                if (legacyPath && fs.existsSync(legacyPath)) return res.sendFile(legacyPath);
            }
            throw createNotFoundError('file', req.params.id);
        }
        const gridfs = await openGridFSFile(organization.logo_gridfs_id, 'organizationLogos');
        res.setHeader('Content-Type', gridfs.file.contentType || 'application/octet-stream');
        res.setHeader('Content-Length', gridfs.file.length);
        res.setHeader('Cache-Control', 'public, max-age=300');
        gridfs.stream.on('error', error => {
            if (!res.headersSent) res.status(500).end();
            else res.destroy(error);
        });
        gridfs.stream.pipe(res);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationLogo
};
