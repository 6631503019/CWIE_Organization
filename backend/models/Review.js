const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
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
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    }
}, {
    timestamps: true
});

// Compound index for organization reviews
reviewSchema.index({ organization_id: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);