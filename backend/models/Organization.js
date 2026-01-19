const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name_th: {
        type: String,
        required: [true, 'Thai organization name is required'],
        trim: true
    },
    name_en: {
        type: String,
        required: [true, 'English organization name is required'],
        trim: true
    },
    address_th: {
        type: String,
        required: [true, 'Thai address is required']
    },
    address_en: {
        type: String,
        required: [true, 'English address is required']
    },
    organization_type: {
        type: String,
        required: [true, 'Organization type is required'],
        enum: ['government', 'private', 'ngo', 'education', 'other']
    },
    industry_category_id: {
        type: String
    },
    country_id: {
        type: String
    },
    geography_id: {
        type: String
    },
    province_id: {
        type: String
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email'
        }
    },
    phone_number: {
        type: String,
        trim: true
    },
    details: {
        type: String,
        maxlength: [1000, 'Details cannot exceed 1000 characters']
    },
    is_public: {
        type: Boolean,
        default: true
    },
    logo_path: {
        type: String
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Admin ID is required']
    }
}, {
    timestamps: true
});

// Indexes for better search performance
organizationSchema.index({ name_th: 'text', name_en: 'text' });
organizationSchema.index({ organization_type: 1 });
organizationSchema.index({ country_id: 1 });
organizationSchema.index({ is_public: 1 });

module.exports = mongoose.model('Organization', organizationSchema);