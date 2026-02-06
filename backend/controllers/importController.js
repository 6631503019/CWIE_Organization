const XLSX = require('xlsx');
const Organization = require('../models/Organization');
const Notification = require('../models/Notification');
const { CustomError, ERROR_CODES } = require('../utils/customError');

// @desc    Import organizations from Excel/CSV file
// @route   POST /api/import/organizations
// @access  Private (Admin)
const importOrganizations = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
                'Please upload a file'
            );
        }

        // Read the uploaded file
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_INVALID_FORMAT,
                'File is empty or invalid format'
            );
        }

        const results = {
            success: [],
            failed: [],
            total: data.length
        };

        // Keep track of unique organizations to avoid duplicates
        const uniqueOrgs = new Map();

        // Process each row
        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            try {
                // Try to extract organization name from __EMPTY_2 column (student report format)
                let orgNameRaw = row['__EMPTY_2'] || row['ชื่อสถานประกอบการ'] || '';

                // Also support standard format
                let name_th = row['Name (TH)'] || row['name_th'] || '';
                let name_en = row['Name (EN)'] || row['name_en'] || '';

                // If orgNameRaw exists, split it into Thai and English names
                if (orgNameRaw && orgNameRaw.includes('\n')) {
                    const parts = orgNameRaw.split('\n');
                    name_th = parts[0].trim();
                    name_en = parts[1].trim();
                } else if (orgNameRaw) {
                    name_th = orgNameRaw.trim();
                    name_en = orgNameRaw.trim();
                }

                // Skip if no organization name found
                if (!name_th && !name_en) {
                    results.failed.push({
                        row: i + 2,
                        data: row,
                        error: 'No organization name found'
                    });
                    continue;
                }

                // Skip header rows or invalid names
                const invalidNames = [
                    'ชื่อสถานประกอบการ',
                    "(Organisation's Name)",
                    'Organisation\'s Name',
                    'Organization Name',
                    'ลำดับ',
                    'No.',
                    '__EMPTY'
                ];

                if (invalidNames.some(invalid =>
                    name_th.includes(invalid) || name_en.includes(invalid)
                )) {
                    continue;
                }

                // Skip duplicates
                const orgKey = `${name_th}_${name_en}`;
                if (uniqueOrgs.has(orgKey)) {
                    continue;
                }
                uniqueOrgs.set(orgKey, true);

                // Generate email from organization name if not provided
                const generateEmail = (name) => {
                    if (!name) return 'contact@organization.com';
                    // Remove special characters, keep only alphanumeric
                    const cleanName = name
                        .toLowerCase()
                        .replace(/[^a-z0-9\s]/g, '')
                        .replace(/\s+/g, '')
                        .substring(0, 20);

                    return cleanName ? `${cleanName}@organization.com` : 'contact@organization.com';
                };

                // Check if organization already exists in database
                const existingOrg = await Organization.findOne({
                    $or: [
                        { name_th: name_th },
                        { name_en: name_en }
                    ]
                });

                if (existingOrg) {
                    results.failed.push({
                        row: i + 2,
                        data: row,
                        error: `Organization "${name_th || name_en}" already exists`
                    });
                    continue;
                }

                // Map Excel columns to database fields
                const orgData = {
                    name_th: name_th || name_en,
                    name_en: name_en || name_th,
                    address_th: row['Address (TH)'] || row['address_th'] || name_th || 'ไม่ระบุที่อยู่',
                    address_en: row['Address (EN)'] || row['address_en'] || name_en || 'Address not specified',
                    organization_type: row['Organization Type'] || row['organization_type'] || 'private company',
                    email: row['Email'] || row['email'] || generateEmail(name_en || name_th),
                    phone_number: row['Phone'] || row['phone_number'] || '',
                    details: row['Details'] || row['details'] || `Imported from student report`,
                    is_public: row['Public'] === 'true' || row['Public'] === true || row['is_public'] === true || false,
                    admin_id: req.user._id
                };

                // Validate required fields
                if (!orgData.name_th || !orgData.name_en || !orgData.email) {
                    results.failed.push({
                        row: i + 2,
                        data: row,
                        error: 'Missing required fields (name_th, name_en, email)'
                    });
                    continue;
                }

                // Create organization
                const organization = await Organization.create(orgData);

                // Create notification
                await Notification.create({
                    requested_by: req.user._id,
                    requested_by_name: req.user.name,
                    action: 'Add',
                    establishment_name: organization.name_en || organization.name_th,
                    establishment_id: organization._id,
                    establishment_type: 'Organization'
                });

                results.success.push({
                    row: i + 2,
                    id: organization._id,
                    name: organization.name_en || organization.name_th
                });

            } catch (error) {
                results.failed.push({
                    row: i + 2,
                    data: row,
                    error: error.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Import completed: ${results.success.length} succeeded, ${results.failed.length} failed`,
            data: results
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    importOrganizations
};
