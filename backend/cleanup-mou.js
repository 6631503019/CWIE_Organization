const mongoose = require('mongoose');
const MOU = require('./models/MOU');

mongoose.connect('mongodb://localhost:27017/cwie_organization')
    .then(async () => {
        console.log('Connected to database');

        // Find invalid MOUs
        const invalidMOUs = await MOU.find({
            $or: [
                { organization_id: null },
                { organization_id: { $exists: false } }
            ]
        });

        console.log('Invalid MOUs found:', invalidMOUs.length);
        invalidMOUs.forEach(m => console.log('- ID:', m._id, 'OrgID:', m.organization_id));

        // Delete invalid MOUs
        const result = await MOU.deleteMany({
            $or: [
                { organization_id: null },
                { organization_id: { $exists: false } }
            ]
        });

        console.log('Deleted', result.deletedCount, 'invalid MOUs');

        // Show remaining MOUs
        const remaining = await MOU.find();
        console.log('\nRemaining MOUs:', remaining.length);
        remaining.forEach(m => console.log('- ID:', m._id, 'OrgID:', m.organization_id, 'Published:', m.is_published));

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
