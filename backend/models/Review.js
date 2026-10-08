const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InternshipRecord',
        required: [true, 'Organization ID is required']
    },
    job_position: {
        type: String,
        required: [true, 'Job position is required'],
        trim: true
    },
    review_text: {
        type: String,
        required: [true, 'Review text is required'],
        maxlength: [2000, 'Review cannot exceed 2000 characters']
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        default: null
    },
    student_id: {
        type: String,
        trim: true
    },
    student_name: {
        type: String,
        trim: true
    },
    organization_name: {
        type: String,
        trim: true
    },
    source_sheet: {
        type: String,
        trim: true
    },
    source_row: {
        type: Number
    },
    review_data: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Compound index for organization reviews
reviewSchema.index({ organization_id: 1, createdAt: -1 });
reviewSchema.index({ source_sheet: 1, source_row: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);