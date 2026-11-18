const mongoose = require('mongoose');

const mouSchema = new mongoose.Schema({
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InternshipRecord',
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
    publication_start_at: {
        type: Date,
        required: false
    },
    publication_end_at: {
        type: Date,
        required: false
    },
    is_published: {
        type: Boolean,
        default: true  // Default to published for new MOUs
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
mouSchema.index({ is_published: 1, publication_start_at: 1, publication_end_at: 1 });

// Virtual for mou_path (alias for mou_file_path with leading slash)
mouSchema.virtual('mou_path').get(function () {
    if (!this.mou_file_path) return null;
    let filePath = this.mou_file_path.replace(/\\/g, '/');
    const uploadsIndex = filePath.indexOf('/uploads/');
    if (uploadsIndex >= 0) filePath = filePath.slice(uploadsIndex);
    if (!filePath.startsWith('uploads/') && !filePath.startsWith('/uploads/') && filePath.includes('uploads/mou/')) {
        filePath = '/' + filePath.slice(filePath.indexOf('uploads/mou/'));
    }
    return filePath.startsWith('/') ? filePath : '/' + filePath;
});

// Ensure virtuals are included in JSON
mouSchema.set('toJSON', { virtuals: true });
mouSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MOU', mouSchema);