const mongoose = require('mongoose');

const roadshowSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: [true, 'Topic is required'],
        trim: true
    },
    details: {
        type: String,
        required: [true, 'Details are required'],
        maxlength: [5000, 'Details cannot exceed 5000 characters']
    },
    event_date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    poster_path: {
        type: String
    },
    activity_image_path: {
        type: String
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
    timestamps: true
});

roadshowSchema.index({ event_date: -1 });
roadshowSchema.index({ is_public: 1 });

module.exports = mongoose.model('Roadshow', roadshowSchema);