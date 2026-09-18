const mongoose = require('mongoose');

const internshipRecordSchema = new mongoose.Schema({
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
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
    source_sheet: { type: String, trim: true },
    source_row: { type: Number }
}, { timestamps: true });

internshipRecordSchema.index({ student_id: 1, academic_year: 1, semester: 1 });
internshipRecordSchema.index({ organization_id: 1 });
internshipRecordSchema.index({ source_sheet: 1, source_row: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('InternshipRecord', internshipRecordSchema);
