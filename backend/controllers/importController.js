const XLSX = require('xlsx');
const fs = require('fs');
const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const InternshipRecord = require('../models/InternshipRecord');
const Review = require('../models/Review');
const { CustomError, ERROR_CODES } = require('../utils/customError');
const { deleteStoredFile } = require('../utils/fileCleanup');

const IMPORT_BATCH_SIZE = 500;
const normalizeHeader = value => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
const normalizeOrganizationName = value => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
const text = value => value === null || value === undefined ? '' : String(value).trim();
const getCellValue = (row, aliases) => {
    const names = aliases.map(normalizeHeader);
    const entry = Object.entries(row).find(([key]) => names.includes(normalizeHeader(key)));
    return entry ? text(entry[1]) : '';
};
const getCellValueContaining = (row, aliases, excluded = []) => {
    const include = aliases.map(normalizeHeader);
    const exclude = excluded.map(normalizeHeader);
    const entry = Object.entries(row).find(([key]) => {
        const name = normalizeHeader(key);
        return include.some(alias => name.includes(alias)) && !exclude.some(alias => name.includes(alias));
    });
    return entry ? text(entry[1]) : '';
};
const getPositionalValue = (row, index) => text(Object.values(row)[index]);
const splitBilingualValue = value => {
    const parts = text(value).split(/\r?\n/).map(part => part.trim()).filter(Boolean);
    return { th: parts[0] || '', en: parts[1] || '' };
};
const isBilingualInternshipRow = row => {
    const values = Object.values(row);
    const keys = Object.keys(row).map(normalizeHeader).join('|');
    return Object.keys(row).length >= 28 &&
        (keys.includes('academic year') || keys.includes('ปีการศึกษา') || keys.includes("organization's name")) &&
        /^\d{4}$/.test(text(values[1])) && /^\d+$/.test(text(values[2])) && Boolean(text(values[7]) && text(values[8]));
};
const addFailedRow = (results, row, error) => results.failed.push({ row: row.rowNumber, data: row.source, error });
const buildInternshipRecord = (row, sheetName, rowNumber) => ({
    academic_year: getPositionalValue(row, 1), semester: getPositionalValue(row, 2),
    province_th: getPositionalValue(row, 3), province_en: getPositionalValue(row, 4),
    country_th: getPositionalValue(row, 5), country_en: getPositionalValue(row, 6),
    organization_name_th: getPositionalValue(row, 7), organization_name_en: getPositionalValue(row, 8),
    address_th: getPositionalValue(row, 9), address_en: getPositionalValue(row, 10),
    telephone: getPositionalValue(row, 11), organization_email: getPositionalValue(row, 12),
    student_id: getPositionalValue(row, 13), student_name_th: getPositionalValue(row, 14),
    student_name_en: getPositionalValue(row, 15), major_th: getPositionalValue(row, 16),
    major_en: getPositionalValue(row, 17), school_th: getPositionalValue(row, 18),
    school_en: getPositionalValue(row, 19), business_type_th: getPositionalValue(row, 20),
    business_type_en: getPositionalValue(row, 21), business_category_th: getPositionalValue(row, 22),
    business_category_en: getPositionalValue(row, 23), multinational_corporation: getPositionalValue(row, 24),
    position_department: getPositionalValue(row, 25), attention_to_th: getPositionalValue(row, 26),
    attention_to_en: getPositionalValue(row, 27), source_sheet: sheetName, source_row: rowNumber
});
const mapRow = (row, sheetName, rowNumber) => {
    const internship = isBilingualInternshipRow(row);
    let name_th = '', name_en = '', address_th = '', address_en = '', email = '', phone = '', province = '', country = '', region = '', businessType = '', businessCategory = '';
    if (internship) {
        province = getPositionalValue(row, 3); country = getPositionalValue(row, 5); name_th = getPositionalValue(row, 7); name_en = getPositionalValue(row, 8);
        address_th = getPositionalValue(row, 9); address_en = getPositionalValue(row, 10); phone = getPositionalValue(row, 11); email = getPositionalValue(row, 12);
        businessType = getPositionalValue(row, 20); businessCategory = getPositionalValue(row, 22);
    } else {
        name_th = getCellValue(row, ['Name (TH)', 'name_th', 'organization_name_th']) || getCellValueContaining(row, ['ชื่อบริษัท', 'ชื่อองค์กร']);
        name_en = getCellValue(row, ['Name (EN)', 'name_en', 'organization_name_en']) || getCellValueContaining(row, ["organization's name", 'organization name'], ['ชื่อบริษัท', 'ชื่อองค์กร']);
        address_th = getCellValue(row, ['Address (TH)', 'address_th']) || getCellValueContaining(row, ['ที่อยู่บริษัท', 'ที่อยู่องค์กร']);
        address_en = getCellValue(row, ['Address (EN)', 'address_en']) || getCellValueContaining(row, ["organization's address", 'organization address'], ['ที่อยู่บริษัท', 'ที่อยู่องค์กร']);
        email = getCellValue(row, ['Email', 'email', 'อีเมลบริษัท', 'อีเมลองค์กร']); phone = getCellValue(row, ['Phone', 'phone_number', 'telephone number', 'เบอร์โทรบริษัท']);
        province = getCellValue(row, ['Province', 'province', 'จังหวัดที่ฝึก']); country = getCellValue(row, ['Country', 'country', 'ประเทศ']);
        businessType = getCellValue(row, ['Organization Type', 'organization_type', 'Business Types', 'ประเภทธุรกิจ']); businessCategory = getCellValue(row, ['Industry Category', 'industry_category_id', 'Business Categories', 'ลักษณะธุรกิจ']);
        const companyName = getCellValueContaining(row, ['ชื่อบริษัท']); if (!name_th && !name_en && companyName) { const value = splitBilingualValue(companyName); name_th = value.th; name_en = value.en; }
        const companyAddress = getCellValueContaining(row, ['ที่อยู่บริษัท']); if (!address_th && companyAddress) { const value = splitBilingualValue(companyAddress); address_th = value.th; address_en = value.en; }
    }
    const typeMap = { 'เอกชน': 'private company', 'รัฐวิสาหกิจ': 'Government', 'รัฐบาล': 'Government', 'ภาครัฐ': 'Government', 'มหาวิทยาลัย': 'MFU', 'ต่างประเทศ': 'Oversea', oversea: 'Oversea', overseas: 'Oversea' };
    let organization_type = getCellValue(row, ['Organization Type', 'organization_type']) || 'private company';
    for (const [source, target] of Object.entries(typeMap)) if (businessType.toLowerCase().includes(source.toLowerCase())) organization_type = target;
    const industryMap = { 'เทคโนโลยีสารสนเทศ': 'Information and Communication Technology', it: 'Information and Communication Technology', technology: 'Information and Communication Technology', เกษตร: 'Agriculture and Food Products', agriculture: 'Agriculture and Food Products', อาหาร: 'Agriculture and Food Products', food: 'Agriculture and Food Products', ยานยนต์: 'Automotive and Transportation Equipment', automotive: 'Automotive and Transportation Equipment', ธนาคาร: 'Banking, Finance and Insurance', การเงิน: 'Banking, Finance and Insurance', finance: 'Banking, Finance and Insurance', สุขภาพ: 'Healthcare', healthcare: 'Healthcare', โรงพยาบาล: 'Healthcare', hotel: 'Tourism and Hospitality', โรงแรม: 'Tourism and Hospitality', tourism: 'Tourism and Hospitality', ขนส่ง: 'Transportation and Logistics', logistics: 'Transportation and Logistics', ค้าปลีก: 'Trading and Distribution', trading: 'Trading and Distribution' };
    let industry_category_id = businessCategory; for (const [source, target] of Object.entries(industryMap)) if (businessCategory.toLowerCase().includes(source.toLowerCase())) industry_category_id = target;
    const details = [province && `จังหวัด: ${province}`, country && `ประเทศ: ${country}`, region && `ภูมิภาค: ${region}`, businessType && `ประเภทธุรกิจ: ${businessType}`].filter(Boolean).join('\n') || getCellValue(row, ['Details', 'details']) || 'Imported from student report';
    return { internship, internshipData: internship ? buildInternshipRecord(row, sheetName, rowNumber) : null, orgData: { name_th, name_en, address_th, address_en, organization_type, industry_category_id, province_id: province || null, country_id: country || null, geography_id: region || null, email, phone_number: phone, details, is_public: row.Public === 'true' || row.Public === true || row.is_public === true, admin_id: null } };
};
const parseWorkbookRows = workbook => {
    const rows = []; const sheetNames = workbook.SheetNames.length > 1 ? workbook.SheetNames.filter(name => !/^review\b/i.test(name)) : workbook.SheetNames;
    for (const sheetName of sheetNames) { const sheetRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' }); if (sheetRows.length && Object.keys(sheetRows[0]).length < 28 && sheetNames.length > 1) continue; sheetRows.forEach((source, index) => rows.push({ source, sheetName, rowNumber: index + 2 })); }
    return rows;
};
const buildReviewOperations = async (workbook, organizationMap, results) => {
    const operations = [];
    for (const sheetName of workbook.SheetNames.filter(name => /^review\b/i.test(name))) {
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });
        for (let index = 3; index < rows.length; index += 1) {
            const row = rows[index]; const studentId = text(row[1]); const names = splitBilingualValue(row[3]); const position = splitBilingualValue(row[20]); const jobPosition = position.en || position.th;
            const reviewData = { strength: text(row[8]), improvement: text(row[13]), assignment: text(row[8]), accommodation: text(row[9]), supervisor: text(row[10]), welfare: text(row[11]), other: text(row[12]), recommendations: text(row[19]), recommended_skills: text(row[21]), employment_status: text(row[22]) };
            const reviewText = [reviewData.strength && `Strength: ${reviewData.strength}`, reviewData.improvement && `Area of Improvement: ${reviewData.improvement}`, reviewData.recommendations && `Recommendations: ${reviewData.recommendations}`].filter(Boolean).join('\n').substring(0, 2000);
            const organization = organizationMap.get(normalizeOrganizationName(names.th)) || organizationMap.get(normalizeOrganizationName(names.en));
            if (!studentId || (!names.th && !names.en) || !jobPosition || !reviewText || !organization) { results.reviewFailed += 1; continue; }
            operations.push({ updateOne: { filter: { source_sheet: sheetName, source_row: index + 1 }, update: { $set: { organization_id: organization._id, job_position: jobPosition, review_text: reviewText, student_id: studentId, student_name: text(row[2]), organization_name: names.en || names.th, source_sheet: sheetName, source_row: index + 1, review_data: reviewData } }, upsert: true } });
        }
    }
    return operations;
};
const runBatches = async (model, operations) => { for (let index = 0; index < operations.length; index += IMPORT_BATCH_SIZE) await model.bulkWrite(operations.slice(index, index + IMPORT_BATCH_SIZE), { ordered: false }); };

const importOrganizations = async (req, res, next) => {
    try {
        if (!req.file) throw new CustomError(ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD, 'Please upload a file');
        let workbook; try { workbook = XLSX.read(fs.readFileSync(req.file.path), { type: 'buffer' }); } catch (error) { throw new CustomError(ERROR_CODES.VALIDATION_INVALID_FORMAT, 'The uploaded file is not a valid CSV or Excel file'); }
        const rows = parseWorkbookRows(workbook); if (!rows.length) throw new CustomError(ERROR_CODES.VALIDATION_INVALID_FORMAT, 'File is empty or invalid format');
        const results = { success: [], failed: [], total: rows.length, reviewSuccess: 0, reviewFailed: 0 }; const organizationMap = new Map(); const validRows = [];
        for (const row of rows) {
            try {
                const mapped = mapRow(row.source, row.sheetName, row.rowNumber); mapped.orgData.admin_id = req.user._id; const missing = ['name_th', 'name_en', 'address_th', 'address_en', 'organization_type', 'email', 'admin_id'].filter(field => !mapped.orgData[field]);
                if (missing.length) { addFailedRow(results, row, `Missing required field(s): ${missing.join(', ')}`); continue; }
                if (!['MFU', 'private company', 'Government', 'Oversea'].includes(mapped.orgData.organization_type)) { addFailedRow(results, row, `Invalid organization_type: ${mapped.orgData.organization_type}`); continue; }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mapped.orgData.email)) { addFailedRow(results, row, 'Invalid email format'); continue; }
                validRows.push({ ...row, ...mapped });
            } catch (error) { addFailedRow(results, row, error.message); }
        }
        const names = [...new Set(validRows.flatMap(row => [row.orgData.name_th, row.orgData.name_en]))];
        const existing = await Organization.find({ $or: [{ name_th: { $in: names } }, { name_en: { $in: names } }] }).lean();
        const existingMap = new Map();
        existing.forEach(org => {
            existingMap.set(normalizeOrganizationName(org.name_th), org);
            existingMap.set(normalizeOrganizationName(org.name_en), org);
        });
        const organizationOps = []; const newIds = new Map(); const organizationGroups = new Map();
        for (const row of validRows) {
            const organizationKey = `${normalizeOrganizationName(row.orgData.name_th)}\u0000${normalizeOrganizationName(row.orgData.name_en)}`;
            if (organizationGroups.has(organizationKey)) continue;
            const oldByName = existingMap.get(normalizeOrganizationName(row.orgData.name_th)) || existingMap.get(normalizeOrganizationName(row.orgData.name_en));
            const old = oldByName;
            const id = old?._id || new mongoose.Types.ObjectId();
            const changes = old ? Object.keys(row.orgData).filter(field => field !== 'admin_id' && String(old[field] ?? '') !== String(row.orgData[field] ?? '')).map(field => `${field} updated`) : [];
            organizationGroups.set(organizationKey, { id, old, row, changes: changes.length ? changes : ['No changes detected'] });
            newIds.set(organizationKey, id);
            const { _id, ...setData } = row.orgData;
            organizationOps.push({ updateOne: { filter: old ? { _id: old._id } : { _id: id }, update: { $set: setData, $setOnInsert: { _id: id } }, upsert: true } });
        }
        await runBatches(Organization, organizationOps);
        const importedRows = validRows;
        existing.forEach(org => { organizationMap.set(normalizeOrganizationName(org.name_th), org); organizationMap.set(normalizeOrganizationName(org.name_en), org); });
        for (const [organizationKey, group] of organizationGroups) {
            organizationMap.set(normalizeOrganizationName(group.row.orgData.name_th), { _id: group.id });
            organizationMap.set(normalizeOrganizationName(group.row.orgData.name_en), { _id: group.id });
            results.success.push({ row: group.row.rowNumber, name: group.row.orgData.name_en || group.row.orgData.name_th, action: group.old ? 'Updated' : 'Created', changes: group.changes });
        }
        await runBatches(InternshipRecord, importedRows.filter(row => row.internshipData).map(row => ({ updateOne: { filter: { source_sheet: row.sheetName, source_row: row.rowNumber }, update: { $set: { ...row.internshipData, organization_id: newIds.get(`${normalizeOrganizationName(row.orgData.name_th)}\u0000${normalizeOrganizationName(row.orgData.name_en)}`) } }, upsert: true } })));
        const reviewOps = await buildReviewOperations(workbook, organizationMap, results); await runBatches(Review, reviewOps); results.reviewSuccess = reviewOps.length;
        res.status(200).json({ success: true, message: `Import completed: ${results.success.length} organizations succeeded, ${results.failed.length} failed, ${results.reviewSuccess} reviews saved`, data: results });
    } catch (error) { next(error); } finally { if (req.file?.path) deleteStoredFile(req.file.path, 'import file'); }
};

module.exports = { importOrganizations };
