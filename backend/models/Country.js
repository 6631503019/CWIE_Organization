const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
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
    code: {
        type: String,
        required: [true, 'Country code is required'],
        unique: true,
        uppercase: true,
        maxlength: [3, 'Country code cannot exceed 3 characters']
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

countrySchema.index({ code: 1 });
countrySchema.index({ is_active: 1 });

module.exports = mongoose.model('Country', countrySchema);