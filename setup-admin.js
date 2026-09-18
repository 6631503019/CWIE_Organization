const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./backend/models/User');

async function createAdminUser() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cwie_organization');
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@mfu.ac.th' });
        if (existingAdmin) {
            console.log('✅ Admin user already exists:', existingAdmin.email);
            console.log('Token ready for use');
            await mongoose.connection.close();
            process.exit(0);
        }

        // Create the admin profile used after Google authentication.
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@mfu.ac.th',
            role: 'admin',
            isActive: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email:', admin.email);
        console.log('Login method: Google Lamduan Mail');
        console.log('Role:', admin.role);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdminUser();
