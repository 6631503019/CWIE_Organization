const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cwie_organization';

const removeOrganizationEmailUniqueIndex = async () => {
    try {
        await mongoose.connect(mongoUri);
        const collection = mongoose.connection.collection('organizations');
        const indexes = await collection.indexes();
        const emailIndex = indexes.find(index => index.name === 'email_1' || (index.key && index.key.email === 1 && index.unique));

        if (!emailIndex) {
            console.log('Organization email unique index not found. Nothing to remove.');
            return;
        }

        await collection.dropIndex(emailIndex.name);
        console.log(`Removed Organization email index: ${emailIndex.name}`);
    } finally {
        await mongoose.disconnect();
    }
};

removeOrganizationEmailUniqueIndex().catch(error => {
    console.error('Failed to remove Organization email unique index:', error.message);
    process.exitCode = 1;
});
