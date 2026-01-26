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

        // Process each row
        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            try {
                // Map Excel columns to database fields
                const orgData = {
                    name_th: row['Name (TH)'] || row['name_th'] || '',
                    name_en: row['Name (EN)'] || row['name_en'] || '',
                    address_th: row['Address (TH)'] || row['address_th'] || '',
                    address_en: row['Address (EN)'] || row['address_en'] || '',
                    organization_type: row['Organization Type'] || row['organization_type'] || 'private company',
                    email: row['Email'] || row['email'] || '',
                    phone_number: row['Phone'] || row['phone_number'] || '',
                    details: row['Details'] || row['details'] || '',
                    is_public: row['Public'] === 'true' || row['Public'] === true || row['is_public'] === true || false,
                    admin_id: req.user._id
                };

                // Validate required fields
                if (!orgData.name_th || !orgData.name_en || !orgData.address_th || !orgData.address_en || !orgData.email) {
                    results.failed.push({
                        row: i + 2, // +2 because: 1 for array index, 1 for header row
                        data: row,
                        error: 'Missing required fields'
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
