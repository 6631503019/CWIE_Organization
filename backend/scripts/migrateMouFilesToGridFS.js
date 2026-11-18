require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const MOU = require('../models/MOU');
const { resolveStoredPath } = require('../utils/fileCleanup');
const { uploadPdfToGridFS, deleteGridFSFile } = require('../config/gridfs');

const migrate = async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const records = await MOU.find({
        $and: [
            { $or: [{ mou_gridfs_id: { $exists: false } }, { mou_gridfs_id: null }] },
            { mou_file_path: { $exists: true, $nin: ['', null] } }
        ]
    });

    let migrated = 0;
    let missing = 0;
    let failed = 0;
    const migratedIds = [];
    const missingIds = [];
    const failedIds = [];

    for (const mou of records) {
        const absolutePath = resolveStoredPath(mou.mou_file_path);
        if (!absolutePath || !fs.existsSync(absolutePath)) {
            missing++;
            missingIds.push(String(mou._id));
            continue;
        }

        const file = {
            path: absolutePath,
            originalname: mou.mou_original_name || path.basename(absolutePath),
            size: fs.statSync(absolutePath).size
        };

        let gridfsId;
        try {
            gridfsId = await uploadPdfToGridFS(file, { mouId: String(mou._id) });
        } catch (error) {
            failed++;
            failedIds.push(String(mou._id));
            console.error('MOU GridFS upload failed', {
                mouId: String(mou._id),
                code: error?.code || error?.name || 'UNKNOWN'
            });
            continue;
        }

        try {
            mou.mou_gridfs_id = gridfsId;
            mou.mou_original_name = file.originalname;
            mou.mou_file_size = file.size;
            await mou.save();
            migrated++;
            migratedIds.push(String(mou._id));
        } catch (error) {
            failed++;
            failedIds.push(String(mou._id));
            await deleteGridFSFile(gridfsId).catch(() => undefined);
            console.error('MOU GridFS metadata update failed', {
                mouId: String(mou._id),
                code: error?.code || error?.name || 'UNKNOWN'
            });
        }
    }

    console.log(JSON.stringify({
        migrated,
        missing,
        failed,
        total: records.length,
        migratedIds,
        missingIds,
        failedIds
    }));
    await mongoose.disconnect();
};

migrate().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
