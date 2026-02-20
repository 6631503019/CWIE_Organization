const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Organization = require('./models/Organization');
const MOU = require('./models/MOU');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cwie_organization')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

const cleanupUploads = async () => {
    try {
        console.log('\n🧹 Starting uploads cleanup...\n');

        // Get all organizations with logo paths
        const organizations = await Organization.find({ logo_path: { $exists: true, $ne: null } });
        const usedLogoPaths = new Set(organizations.map(org => org.logo_path));
        console.log(`📊 Found ${usedLogoPaths.size} logos in database`);

        // Get all MOUs with file paths
        const mous = await MOU.find({ mou_file_path: { $exists: true, $ne: null } });
        const usedMouPaths = new Set(mous.map(mou => mou.mou_file_path));
        console.log(`📊 Found ${usedMouPaths.size} MOU files in database`);

        // Scan logos directory
        const logosDir = path.join(__dirname, 'uploads', 'logos');
        if (fs.existsSync(logosDir)) {
            const logoFiles = fs.readdirSync(logosDir);
            console.log(`\n📁 Scanning logos directory: ${logoFiles.length} files found`);

            let deletedLogos = 0;
            logoFiles.forEach(file => {
                const filePath = `/uploads/logos/${file}`;
                if (!usedLogoPaths.has(filePath)) {
                    const fullPath = path.join(logosDir, file);
                    try {
                        fs.unlinkSync(fullPath);
                        console.log(`  ❌ Deleted unused logo: ${file}`);
                        deletedLogos++;
                    } catch (err) {
                        console.error(`  ⚠️  Failed to delete ${file}:`, err.message);
                    }
                } else {
                    console.log(`  ✅ Keeping used logo: ${file}`);
                }
            });
            console.log(`\n🗑️  Deleted ${deletedLogos} unused logo files`);
        }

        // Scan MOU directory
        const mouDir = path.join(__dirname, 'uploads', 'mou');
        if (fs.existsSync(mouDir)) {
            const mouFiles = fs.readdirSync(mouDir);
            console.log(`\n📁 Scanning MOU directory: ${mouFiles.length} files found`);

            let deletedMous = 0;
            mouFiles.forEach(file => {
                const filePath = `uploads/mou/${file}`;
                const altPath = `/uploads/mou/${file}`;
                
                if (!usedMouPaths.has(filePath) && !usedMouPaths.has(altPath)) {
                    const fullPath = path.join(mouDir, file);
                    try {
                        fs.unlinkSync(fullPath);
                        console.log(`  ❌ Deleted unused MOU: ${file}`);
                        deletedMous++;
                    } catch (err) {
                        console.error(`  ⚠️  Failed to delete ${file}:`, err.message);
                    }
                } else {
                    console.log(`  ✅ Keeping used MOU: ${file}`);
                }
            });
            console.log(`\n🗑️  Deleted ${deletedMous} unused MOU files`);
        }

        console.log('\n✨ Cleanup completed!\n');
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run cleanup
cleanupUploads();
