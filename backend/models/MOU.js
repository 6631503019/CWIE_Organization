const mongoose = require('mongoose');

const mouSchema = new mongoose.Schema({
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'Organization ID is required']
    },
    mou_file_path: {
        type: String,
        required: [true, 'MOU file path is required']
    },
    start_date: {
        type: Date,
        required: false
    },
    end_date: {
        type: Date,
        required: false
    },
    is_published: {
        type: Boolean,
        default: false
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Admin ID is required']
    }
}, {
    timestamps: true
});

mouSchema.index({ organization_id: 1 });
mouSchema.index({ is_published: 1 });

// Virtual for mou_path (alias for mou_file_path with leading slash)
mouSchema.virtual('mou_path').get(function () {
    if (!this.mou_file_path) return null;
    const path = this.mou_file_path.replace(/\\/g, '/');
    return path.startsWith('/') ? path : '/' + path;
});

// Ensure virtuals are included in JSON
mouSchema.set('toJSON', { virtuals: true });
mouSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MOU', mouSchema);