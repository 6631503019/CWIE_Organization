const mongoose = require('mongoose');
const { normalizeRoadshowTime, formatRoadshowTime } = require('../utils/roadshowTime');

const roadshowSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: [true, 'Topic is required'],
        trim: true
    },
    title_en: {
        type: String,
        trim: true,
        maxlength: [500, 'English title cannot exceed 500 characters']
    },
    title_th: {
        type: String,
        trim: true,
        maxlength: [500, 'Thai title cannot exceed 500 characters']
    },
    details: {
        type: String,
        required: [true, 'Details are required'],
        maxlength: [5000, 'Details cannot exceed 5000 characters']
    },
    organization: {
        type: String,
        trim: true,
        maxlength: [500, 'Organization cannot exceed 500 characters']
    },
    organization_en: {
        type: String,
        trim: true,
        maxlength: [500, 'English organization cannot exceed 500 characters']
    },
    organization_th: {
        type: String,
        trim: true,
        maxlength: [500, 'Thai organization cannot exceed 500 characters']
    },
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InternshipRecord',
        default: null
    },
    location: {
        type: String,
        trim: true,
        maxlength: [500, 'Location cannot exceed 500 characters']
    },
    time: {
        type: String,
        trim: true,
        set: normalizeRoadshowTime,
        get: formatRoadshowTime
    },
    event_date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    posted_date: {
        type: Date,
        required: [true, 'Posted date is required']
    },
    deleted_date: {
        type: Date
    },
    poster_path: {
        type: String
    },
    activity_image_paths: {
        type: [String],
        default: []
    },
    is_public: {
        type: Boolean,
        default: true
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Admin ID is required']
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

roadshowSchema.index({ event_date: -1 });
roadshowSchema.index({ posted_date: -1 });
roadshowSchema.index({ deleted_date: -1 });
roadshowSchema.index({ is_public: 1 });
roadshowSchema.index({ organization_id: 1 });

module.exports = mongoose.model('Roadshow', roadshowSchema);