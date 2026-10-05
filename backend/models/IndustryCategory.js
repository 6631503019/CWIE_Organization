const mongoose = require('mongoose');

const industryCategorySchema = new mongoose.Schema({
    name_th: {
        type: String,
        required: [true, 'Thai name is required'],
        trim: true
    },
    name_en: {
        type: String,
        required: [true, 'English name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

industryCategorySchema.index({ is_active: 1 });
industryCategorySchema.index({ name_en: 1 });

module.exports = mongoose.model('IndustryCategory', industryCategorySchema);