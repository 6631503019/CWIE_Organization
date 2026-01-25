const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    requested_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    requested_by_name: {
        type: String,
        required: [true, 'User name is required']
    },
    action: {
        type: String,
        required: [true, 'Action is required'],
        enum: ['Add', 'Edit', 'Delete', 'Blacklist']
    },
    establishment_name: {
        type: String,
        required: [true, 'Establishment name is required']
    },
    establishment_id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'establishment_type'
    },
    establishment_type: {
        type: String,
        enum: ['Organization', 'Roadshow'],
        default: 'Organization'
    },
    date: {
        type: Date,
        default: Date.now
    },
    is_read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient querying
notificationSchema.index({ date: -1 });
notificationSchema.index({ is_read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
