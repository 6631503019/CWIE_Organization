const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Organization = require('./models/Organization');
const MOU = require('./models/MOU');
const Roadshow = require('./models/Roadshow');

const normalizeStoredPath = (value) => {
    if (!value || typeof value !== 'string') {
        return null;
    }

    return value.replace(/\\/g, '/').replace(/^\/+/, '');
};

const primaryMongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cwie_organization';
const fallbackMongoUri = process.env.MONGODB_URI_FALLBACK || 'mongodb://127.0.0.1:27017/cwie_organization';

const connectMongo = async () => {
    try {
        await mongoose.connect(primaryMongoUri);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        const isSrvDnsError =
            primaryMongoUri.startsWith('mongodb+srv://') &&
            (error?.code === 'ESERVFAIL' || error?.syscall === 'querySrv');

        if (isSrvDnsError && fallbackMongoUri && fallbackMongoUri !== primaryMongoUri) {
            console.warn('⚠️ Atlas SRV DNS lookup failed, trying fallback MongoDB URI...');
            try {
                await mongoose.connect(fallbackMongoUri);
                console.log('✅ Connected to MongoDB (fallback URI)');
                return;
            } catch (fallbackError) {
                console.error('❌ MongoDB fallback connection error:', fallbackError);
                process.exit(1);
            }
        }

        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const cleanupUploads = async () => {
    try {
        console.log('\n🧹 Starting uploads cleanup...\n');

        // Get all organizations with logo paths
        const organizations = await Organization.find({ logo_path: { $exists: true, $ne: null } });
        const usedLogoPaths = new Set(
            organizations
                .map(org => normalizeStoredPath(org.logo_path))
                .filter(Boolean)
        );
        console.log(`📊 Found ${usedLogoPaths.size} logos in database`);

        // Get all MOUs with file paths
        const mous = await MOU.find({ mou_file_path: { $exists: true, $ne: null } });
        const usedMouPaths = new Set(
            mous
                .map(mou => normalizeStoredPath(mou.mou_file_path))
                .filter(Boolean)
        );
        console.log(`📊 Found ${usedMouPaths.size} MOU files in database`);

        // Get all Roadshows with file paths
        const roadshows = await Roadshow.find({
            $or: [
                { poster_path: { $exists: true, $ne: null } },
                { activity_image_path: { $exists: true, $ne: null } }
            ]
        });

        const usedPosterPaths = new Set(
            roadshows
                .map(item => normalizeStoredPath(item.poster_path))
                .filter(Boolean)
        );

        const usedActivityPaths = new Set(
            roadshows
                .map(item => normalizeStoredPath(item.activity_image_path))
                .filter(Boolean)
        );

        console.log(`📊 Found ${usedPosterPaths.size} roadshow posters in database`);
        console.log(`📊 Found ${usedActivityPaths.size} roadshow activity images in database`);

        // Scan logos directory
        const logosDir = path.join(__dirname, 'uploads', 'logos');
        if (fs.existsSync(logosDir)) {
            const logoFiles = fs.readdirSync(logosDir);
            console.log(`\n📁 Scanning logos directory: ${logoFiles.length} files found`);

            let deletedLogos = 0;
            logoFiles.forEach(file => {
                const filePath = `uploads/logos/${file}`;
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
                
                if (!usedMouPaths.has(filePath)) {
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

        // Scan roadshow poster directory
        const posterDir = path.join(__dirname, 'uploads', 'posters');
        if (fs.existsSync(posterDir)) {
            const posterFiles = fs.readdirSync(posterDir);
            console.log(`\n📁 Scanning posters directory: ${posterFiles.length} files found`);

            let deletedPosters = 0;
            posterFiles.forEach(file => {
                const filePath = `uploads/posters/${file}`;
                if (!usedPosterPaths.has(filePath)) {
                    const fullPath = path.join(posterDir, file);
                    try {
                        fs.unlinkSync(fullPath);
                        console.log(`  ❌ Deleted unused poster: ${file}`);
                        deletedPosters++;
                    } catch (err) {
                        console.error(`  ⚠️  Failed to delete ${file}:`, err.message);
                    }
                } else {
                    console.log(`  ✅ Keeping used poster: ${file}`);
                }
            });
            console.log(`\n🗑️  Deleted ${deletedPosters} unused poster files`);
        }

        // Scan roadshow activity directory
        const activityDir = path.join(__dirname, 'uploads', 'activities');
        if (fs.existsSync(activityDir)) {
            const activityFiles = fs.readdirSync(activityDir);
            console.log(`\n📁 Scanning activities directory: ${activityFiles.length} files found`);

            let deletedActivities = 0;
            activityFiles.forEach(file => {
                const filePath = `uploads/activities/${file}`;
                if (!usedActivityPaths.has(filePath)) {
                    const fullPath = path.join(activityDir, file);
                    try {
                        fs.unlinkSync(fullPath);
                        console.log(`  ❌ Deleted unused activity image: ${file}`);
                        deletedActivities++;
                    } catch (err) {
                        console.error(`  ⚠️  Failed to delete ${file}:`, err.message);
                    }
                } else {
                    console.log(`  ✅ Keeping used activity image: ${file}`);
                }
            });
            console.log(`\n🗑️  Deleted ${deletedActivities} unused activity files`);
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
connectMongo().then(cleanupUploads);
