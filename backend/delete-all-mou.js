const mongoose = require('mongoose');
const MOU = require('./models/MOU');
require('dotenv').config();

async function deleteAllMOUs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database');

        // Get all MOUs
        const allMOUs = await MOU.find();
        console.log('Total MOUs found:', allMOUs.length);

        allMOUs.forEach(mou => {
            console.log('MOU:', {
                id: mou._id,
                organization_id: mou.organization_id,
                is_published: mou.is_published,
                document_path: mou.document_path
            });
        });

        // Delete all MOUs
        const result = await MOU.deleteMany({});
        console.log('\nDeleted all MOUs:', result.deletedCount);

        // Verify deletion
        const remaining = await MOU.find();
        console.log('Remaining MOUs:', remaining.length);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

deleteAllMOUs();
