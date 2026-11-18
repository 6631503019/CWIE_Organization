require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const MOU = require('../models/MOU');
const { resolveStoredPath } = require('../utils/fileCleanup');
const { isR2Configured, uploadMouFile } = require('../config/objectStorage');

const migrate = async () => {
    if (!isR2Configured()) {
        throw new Error('R2 credentials and bucket are not configured');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const records = await MOU.find({
        $or: [
            { mou_storage_provider: { $ne: 'r2' } },
            { mou_object_key: { $exists: false } }
        ]
    });

    let migrated = 0;
    let missing = 0;

    for (const mou of records) {
        const absolutePath = resolveStoredPath(mou.mou_file_path);
        if (!absolutePath || !fs.existsSync(absolutePath)) {
            missing++;
            continue;
        }

        const file = {
            path: absolutePath,
            originalname: mou.mou_original_name || path.basename(absolutePath),
            size: fs.statSync(absolutePath).size
        };
        const stored = await uploadMouFile(file);
        mou.mou_object_key = stored.objectKey;
        mou.mou_storage_provider = 'r2';
        mou.mou_original_name = stored.originalName;
        mou.mou_file_size = stored.size;
        mou.mou_file_path = `/api/mou/${mou._id}/file`;
        await mou.save();
        migrated++;
    }

    console.log(JSON.stringify({ migrated, missing, total: records.length }));
    await mongoose.disconnect();
};

migrate().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
