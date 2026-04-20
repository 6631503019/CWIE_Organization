const mongoose = require('mongoose');
const Organization = require('./models/Organization');
require('dotenv').config();

async function deleteOrganizationByName() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database');

        // Find organization by name
        const organization = await Organization.findOne({
            $or: [
                { name_en: 'rtgrt' },
                { name_th: 'rtgrt' }
            ]
        });

        if (!organization) {
            console.log('Organization "rtgrt" not found');
            process.exit(0);
        }

        console.log('Organization found:', {
            id: organization._id,
            name_en: organization.name_en,
            name_th: organization.name_th,
            email: organization.email,
            organization_type: organization.organization_type
        });

        // Delete the organization
        const result = await Organization.deleteOne({ _id: organization._id });
        console.log('\nDeleted organization:', result.deletedCount);

        // Verify deletion
        const remaining = await Organization.findOne({
            $or: [
                { name_en: 'rtgrt' },
                { name_th: 'rtgrt' }
            ]
        });

        if (!remaining) {
            console.log('Verification: Organization "rtgrt" successfully deleted');
        } else {
            console.log('Error: Organization still exists');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

deleteOrganizationByName();
