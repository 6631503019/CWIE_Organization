const mongoose = require('mongoose');

const internshipRecordSchema = new mongoose.Schema({
    record_type: {
        type: String,
        enum: ['internship', 'organization'],
        default: 'internship',
        index: true
    },
    organization_key: {
        type: String,
        trim: true,
        index: true,
        sparse: true
    },
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InternshipRecord',
        default: null
    },
    academic_year: { type: String, trim: true },
    semester: { type: String, trim: true },
    province_th: { type: String, trim: true },
    province_en: { type: String, trim: true },
    country_th: { type: String, trim: true },
    country_en: { type: String, trim: true },
    organization_name_th: { type: String, trim: true },
    organization_name_en: { type: String, trim: true },
    address_th: { type: String, trim: true },
    address_en: { type: String, trim: true },
    telephone: { type: String, trim: true },
    organization_email: { type: String, trim: true, lowercase: true },
    student_id: { type: String, trim: true },
    student_name_th: { type: String, trim: true },
    student_name_en: { type: String, trim: true },
    major_th: { type: String, trim: true },
    major_en: { type: String, trim: true },
    school_th: { type: String, trim: true },
    school_en: { type: String, trim: true },
    business_type_th: { type: String, trim: true },
    business_type_en: { type: String, trim: true },
    business_category_th: { type: String, trim: true },
    business_category_en: { type: String, trim: true },
    multinational_corporation: { type: String, trim: true },
    position_department: { type: String, trim: true },
    attention_to_th: { type: String, trim: true },
    attention_to_en: { type: String, trim: true },
    organization_type: {
        type: String,
        enum: ['MFU', 'private company', 'Government', 'Oversea']
    },
    industry_category_id: { type: String, trim: true },
    geography_id: { type: String, trim: true },
    province_id: { type: String, trim: true },
    is_public: { type: Boolean, default: true },
    logo_path: { type: String, trim: true },
    details: { type: String, trim: true, maxlength: 1000 },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    source_sheet: { type: String, trim: true },
    source_row: { type: Number }
}, { timestamps: true });

internshipRecordSchema.index({ student_id: 1, academic_year: 1, semester: 1 });
internshipRecordSchema.index({ organization_id: 1 });
internshipRecordSchema.index({ organization_key: 1 }, { unique: true, sparse: true });

internshipRecordSchema.virtual('name_th').get(function () { return this.organization_name_th; });
internshipRecordSchema.virtual('name_en').get(function () { return this.organization_name_en; });
internshipRecordSchema.virtual('email').get(function () { return this.organization_email; });
internshipRecordSchema.virtual('phone_number').get(function () { return this.telephone; });
internshipRecordSchema.set('toJSON', { virtuals: true });
internshipRecordSchema.set('toObject', { virtuals: true });
internshipRecordSchema.index({ source_sheet: 1, source_row: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('InternshipRecord', internshipRecordSchema);
