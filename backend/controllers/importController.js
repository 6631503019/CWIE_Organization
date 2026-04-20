const XLSX = require('xlsx');
const fs = require('fs');
const Organization = require('../models/Organization');
const Notification = require('../models/Notification');
const Country = require('../models/Country');
const IndustryCategory = require('../models/IndustryCategory');
const { CustomError, ERROR_CODES } = require('../utils/customError');
const { deleteStoredFile } = require('../utils/fileCleanup');

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

        // Read the uploaded file as buffer to avoid extension-based parser issues
        // (supports csv/xls/xlsx and also mistyped .xlxs files if content is valid)
        const fileBuffer = fs.readFileSync(req.file.path);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
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
                // Support multiple CSV formats
                let name_th = '';
                let name_en = '';
                let address_th = '';
                let address_en = '';
                let phone = '';
                let email = '';
                let province = '';
                let country = '';
                let region = '';
                let businessType = '';
                let paymentDetails = '';
                let welfareDetails = '';

                // Format 1: Student evaluation report (รายงานผลการประเมิน 03-4)
                // This is the default format we should support
                let orgNameFromEval = row['__EMPTY_2'] || '';
                let paymentDetailsRaw = row['__EMPTY_4'] || '';
                let welfareDetailsRaw = row['__EMPTY_6'] || '';

                // Format 2: Summary internship report (รายงานสรุปการฝึก)
                // Support both __EMPTY_X format and full column names
                const provinceKey = Object.keys(row).find(k => k.includes('จังหวัดที่ฝึก')) || '__EMPTY_4';
                const countryKey = Object.keys(row).find(k => k.includes('ประเทศ') && k.includes('Country')) || '__EMPTY_5';
                const orgNameKey = Object.keys(row).find(k => k.includes('ชื่อบริษัท')) || '__EMPTY_6';
                const addressKey = Object.keys(row).find(k => k.includes('ที่อยู่บริษัท')) || '__EMPTY_7';
                const phoneKey = Object.keys(row).find(k => k.includes('เบอร์โทรบริษัท')) || '__EMPTY_8';
                const emailKey = Object.keys(row).find(k => k.includes('อีเมลบริษัท')) || '__EMPTY_9';
                const regionKey = Object.keys(row).find(k => k.includes('ภูมิภาค')) || '__EMPTY_23';
                const businessTypeKey = Object.keys(row).find(k => k.includes('ประเภทธุรกิจ')) || '__EMPTY_24';
                const businessCategoryKey = Object.keys(row).find(k => k.includes('ลักษณะธุรกิจ')) || '__EMPTY_25';

                let internshipProvince = row[provinceKey] || '';
                let internshipCountry = row[countryKey] || '';
                let companyName = row[orgNameKey] || '';
                let companyAddress = row[addressKey] || '';
                let companyPhone = row[phoneKey] || '';
                let companyEmail = row[emailKey] || '';
                let companyRegion = row[regionKey] || '';
                let companyBusinessType = row[businessTypeKey] || '';
                let companyBusinessCategory = row[businessCategoryKey] || '';

                // Format 3: Standard format
                name_th = row['Name (TH)'] || row['name_th'] || '';
                name_en = row['Name (EN)'] || row['name_en'] || '';

                // Process Format 1 (evaluation report 03-4) - NEW DEFAULT FORMAT
                if (orgNameFromEval && !name_th && !name_en) {
                    // Check if this looks like org name (not header or empty data)
                    if (orgNameFromEval.includes('บริษัท') ||
                        orgNameFromEval.includes('Company') ||
                        orgNameFromEval.includes('จำกัด') ||
                        orgNameFromEval.includes('Ltd') ||
                        orgNameFromEval.includes('ศูนย์') ||
                        orgNameFromEval.includes('สำนัก') ||
                        orgNameFromEval.includes('กรม') ||
                        orgNameFromEval.includes('มหาวิทยาลัย')) {

                        name_th = orgNameFromEval.trim();
                        name_en = orgNameFromEval.trim();

                        // Extract payment and welfare details
                        if (paymentDetailsRaw && paymentDetailsRaw.trim()) {
                            paymentDetails = paymentDetailsRaw.trim();
                        }
                        if (welfareDetailsRaw && welfareDetailsRaw.trim()) {
                            welfareDetails = welfareDetailsRaw.trim();
                        }
                    }
                }

                // Process Format 2 (summary report with ชื่อบริษัท)
                if (companyName && !name_th && !name_en) {
                    if (companyName.includes('\n')) {
                        const parts = companyName.split('\n');
                        name_th = parts[0].trim();
                        name_en = parts[1].trim();
                    } else {
                        name_th = companyName.trim();
                        name_en = companyName.trim();
                    }

                    // Extract additional data from Format 2
                    if (companyAddress) {
                        address_th = companyAddress.trim();
                        address_en = companyAddress.trim();
                    }
                    if (companyPhone) phone = companyPhone.trim();
                    if (companyEmail) email = companyEmail.trim();
                    if (internshipProvince) province = internshipProvince.trim();
                    if (internshipCountry) country = internshipCountry.trim();
                    if (companyRegion) region = companyRegion.trim();
                    if (companyBusinessType) businessType = companyBusinessType.trim();

                    // Also check for business category as additional info
                    if (companyBusinessCategory) {
                        if (businessType) {
                            businessType += ` (${companyBusinessCategory.trim()})`;
                        } else {
                            businessType = companyBusinessCategory.trim();
                        }
                    }
                }

                // Skip if no organization name found (but check header first)
                if (!name_th && !name_en) {
                    // Check if this is a header row or empty row - if so, skip silently
                    const allEmpty = Object.values(row).every(val => !val || String(val).trim() === '');
                    if (allEmpty) {
                        continue; // Skip empty rows silently
                    }

                    // Check if any value contains header keywords
                    const rowValues = Object.values(row).join('|').toLowerCase();
                    if (rowValues.includes('รายงานข้อมูล') ||
                        rowValues.includes('mfu internship') ||
                        rowValues.includes('ภาคการศึกษา') ||
                        rowValues.includes('semester') ||
                        rowValues.includes('เทคโนโลยีดิจิทัล') ||
                        rowValues.includes('ชื่อสถานประกอบการ') ||
                        rowValues.includes('organisation\'s name') ||
                        rowValues.includes('student id') ||
                        rowValues.includes('รหัสนักศึกษา') ||
                        rowValues.includes('school of')) {
                        continue; // Skip header rows silently
                    }

                    // Check if this looks like a student row without org name (has student ID but no org)
                    const hasStudentId = row['__EMPTY'] && !isNaN(row['__EMPTY']);
                    const hasStudentName = row['__EMPTY_1'] && (row['__EMPTY_1'].includes('นาย') || row['__EMPTY_1'].includes('นางสาว') || row['__EMPTY_1'].includes('นาง'));
                    if (hasStudentId && hasStudentName && !row['__EMPTY_2']) {
                        // This is a valid student row but organization not specified
                        continue; // Skip silently - student hasn't chosen organization yet
                    }

                    // If we get here, it's a real data row with no name
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
                    'ชื่อบริษัท',
                    "(Organisation's Name)",
                    "Organization's Name",
                    'Organisation\'s Name',
                    'Organization Name',
                    'Processing by Site-visit Advisor',
                    'Application Status',
                    'ลำดับ',
                    'ลำดับที่',
                    'No.',
                    '__EMPTY',
                    'Internship Status',
                    'Site-visit',
                    'Advisor',
                    'Academic Year',
                    'Semester',
                    'รายงานข้อมูล',
                    'MFU Internship',
                    'Organization and Student',
                    'ภาคการศึกษา',
                    'เทคโนโลยีดิจิทัล'
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

                // Build details text from available information
                let detailsText = '';

                // Add province, country, region info if available
                if (province) {
                    detailsText += `จังหวัด: ${province}`;
                }
                if (country) {
                    if (detailsText) detailsText += '\n';
                    detailsText += `ประเทศ: ${country}`;
                }
                if (region) {
                    if (detailsText) detailsText += '\n';
                    detailsText += `ภูมิภาค: ${region}`;
                }
                if (businessType) {
                    if (detailsText) detailsText += '\n';
                    detailsText += `ประเภทธุรกิจ: ${businessType}`;
                }

                // Add payment and welfare details
                if (paymentDetails && paymentDetails.trim()) {
                    if (detailsText) detailsText += '\n';
                    detailsText += `ค่าตอบแทน: ${paymentDetails.trim()}`;
                }
                if (welfareDetails && welfareDetails.trim()) {
                    if (detailsText) detailsText += '\n';
                    detailsText += `สวัสดิการ: ${welfareDetails.trim()}`;
                }

                // Fallback to manual Details field or default message
                if (!detailsText) {
                    detailsText = row['Details'] || row['details'] || 'Imported from student report';
                }

                // Map organization type from Thai business type
                let orgType = row['Organization Type'] || row['organization_type'] || 'private company';
                if (businessType) {
                    const typeMap = {
                        'เอกชน': 'private company',
                        'รัฐวิสาหกิจ': 'Government',
                        'รัฐบาล': 'Government',
                        'ภาครัฐ': 'Government',
                        'มหาวิทยาลัย': 'MFU',
                        'ต่างประเทศ': 'Oversea',
                        'oversea': 'Oversea',
                        'overseas': 'Oversea'
                    };
                    const normalizedType = businessType.toLowerCase().trim();
                    for (const [thai, eng] of Object.entries(typeMap)) {
                        if (normalizedType.includes(thai.toLowerCase()) || normalizedType.includes(eng.toLowerCase())) {
                            orgType = typeMap[thai];
                            break;
                        }
                    }
                }

                // Map industry category from business category
                let industryCategory = '';
                if (companyBusinessCategory) {
                    const industryMap = {
                        'เทคโนโลยีสารสนเทศ': 'Information and Communication Technology',
                        'ไอที': 'Information and Communication Technology',
                        'it': 'Information and Communication Technology',
                        'technology': 'Information and Communication Technology',
                        'เกษตร': 'Agriculture and Food Products',
                        'agriculture': 'Agriculture and Food Products',
                        'อาหาร': 'Agriculture and Food Products',
                        'food': 'Agriculture and Food Products',
                        'ยานยนต์': 'Automotive and Transportation Equipment',
                        'automotive': 'Automotive and Transportation Equipment',
                        'ธนาคาร': 'Banking, Finance and Insurance',
                        'การเงิน': 'Banking, Finance and Insurance',
                        'bank': 'Banking, Finance and Insurance',
                        'finance': 'Banking, Finance and Insurance',
                        'พลังงาน': 'Energy',
                        'energy': 'Energy',
                        'สุขภาพ': 'Healthcare',
                        'healthcare': 'Healthcare',
                        'โรงพยาบาล': 'Healthcare',
                        'hospital': 'Healthcare',
                        'การผลิต': 'Manufacturing and Industrial Products',
                        'manufacturing': 'Manufacturing and Industrial Products',
                        'อุตสาหกรรม': 'Manufacturing and Industrial Products',
                        'industrial': 'Manufacturing and Industrial Products',
                        'ท่องเที่ยว': 'Tourism and Hospitality',
                        'tourism': 'Tourism and Hospitality',
                        'โรงแรม': 'Tourism and Hospitality',
                        'hotel': 'Tourism and Hospitality',
                        'ขนส่ง': 'Transportation and Logistics',
                        'logistics': 'Transportation and Logistics',
                        'transportation': 'Transportation and Logistics',
                        'ค้าปลีก': 'Trading and Distribution',
                        'trading': 'Trading and Distribution',
                        'distribution': 'Trading and Distribution'
                    };

                    const normalizedCategory = companyBusinessCategory.toLowerCase().trim();
                    for (const [keyword, category] of Object.entries(industryMap)) {
                        if (normalizedCategory.includes(keyword.toLowerCase())) {
                            industryCategory = category;
                            break;
                        }
                    }

                    // If no match, use business category as-is
                    if (!industryCategory) {
                        industryCategory = companyBusinessCategory.trim();
                    }
                }

                // Find province_id, country_id, geography_id from database
                let province_id = null;
                let country_id = null;
                let geography_id = null;

                console.log('[DEBUG] Looking for - Country:', country, 'Province:', province, 'Region:', region);

                // Store location directly as text (no database lookup needed)
                // Map Excel columns to database fields
                const orgData = {
                    name_th: name_th || name_en,
                    name_en: name_en || name_th,
                    address_th: address_th || row['Address (TH)'] || row['address_th'] || name_th || 'ไม่ระบุที่อยู่',
                    address_en: address_en || row['Address (EN)'] || row['address_en'] || name_en || 'Address not specified',
                    organization_type: orgType,
                    industry_category_id: industryCategory || row['Industry Category'] || row['industry_category_id'] || '',
                    province_id: province || null,  // Store Thai text directly
                    country_id: country || null,    // Store Thai text directly
                    geography_id: region || null,   // Store Thai text directly
                    email: email || row['Email'] || row['email'] || generateEmail(name_en || name_th),
                    phone_number: phone || row['Phone'] || row['phone_number'] || '',
                    details: detailsText,
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

                // Check if organization already exists in database
                const existingOrg = await Organization.findOne({
                    $or: [
                        { name_th: name_th },
                        { name_en: name_en }
                    ]
                });

                let organization;
                let actionType;

                if (existingOrg) {
                    // Compare old and new data
                    const changes = [];
                    if (existingOrg.address_th !== orgData.address_th) changes.push(`address_th: "${existingOrg.address_th}" → "${orgData.address_th}"`);
                    if (existingOrg.address_en !== orgData.address_en) changes.push(`address_en: "${existingOrg.address_en}" → "${orgData.address_en}"`);
                    if (existingOrg.organization_type !== orgData.organization_type) changes.push(`type: "${existingOrg.organization_type}" → "${orgData.organization_type}"`);
                    if (existingOrg.industry_category_id !== orgData.industry_category_id) changes.push(`industry: "${existingOrg.industry_category_id}" → "${orgData.industry_category_id}"`);
                    if (String(existingOrg.province_id) !== String(orgData.province_id)) changes.push(`province_id changed`);
                    if (String(existingOrg.country_id) !== String(orgData.country_id)) changes.push(`country_id changed`);
                    if (String(existingOrg.geography_id) !== String(orgData.geography_id)) changes.push(`geography_id changed`);
                    if (existingOrg.email !== orgData.email) changes.push(`email: "${existingOrg.email}" → "${orgData.email}"`);
                    if (existingOrg.phone_number !== orgData.phone_number) changes.push(`phone: "${existingOrg.phone_number}" → "${orgData.phone_number}"`);
                    if (existingOrg.details !== orgData.details) changes.push(`details updated`);
                    if (existingOrg.is_public !== orgData.is_public) changes.push(`is_public: ${existingOrg.is_public} → ${orgData.is_public}`);

                    // Update existing organization - use direct assignment to handle null values
                    existingOrg.name_th = orgData.name_th;
                    existingOrg.name_en = orgData.name_en;
                    existingOrg.address_th = orgData.address_th;
                    existingOrg.address_en = orgData.address_en;
                    existingOrg.organization_type = orgData.organization_type;
                    existingOrg.industry_category_id = orgData.industry_category_id;
                    existingOrg.province_id = orgData.province_id;
                    existingOrg.country_id = orgData.country_id;
                    existingOrg.geography_id = orgData.geography_id;
                    existingOrg.email = orgData.email;
                    existingOrg.phone_number = orgData.phone_number;
                    existingOrg.details = orgData.details;
                    existingOrg.is_public = orgData.is_public;
                    existingOrg.admin_id = orgData.admin_id;

                    organization = await existingOrg.save();

                    actionType = 'Update';

                    results.success.push({
                        row: i + 2,
                        id: organization._id,
                        name: organization.name_en || organization.name_th,
                        action: 'Updated',
                        changes: changes.length > 0 ? changes : ['No changes detected']
                    });
                } else {
                    // Create new organization
                    organization = await Organization.create(orgData);
                    actionType = 'Add';

                    results.success.push({
                        row: i + 2,
                        id: organization._id,
                        name: organization.name_en || organization.name_th,
                        action: 'Created'
                    });
                }

                // Create notification
                await Notification.create({
                    requested_by: req.user._id,
                    requested_by_name: req.user.name,
                    action: actionType,
                    establishment_name: organization.name_en || organization.name_th,
                    establishment_id: organization._id,
                    establishment_type: 'Organization'
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
    } finally {
        if (req.file?.path) {
            deleteStoredFile(req.file.path, 'import file');
        }
    }
};

module.exports = {
    importOrganizations
};
