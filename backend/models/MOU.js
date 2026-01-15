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
    is_published: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

mouSchema.index({ organization_id: 1 });
mouSchema.index({ is_published: 1 });

module.exports = mongoose.model('MOU', mouSchema);