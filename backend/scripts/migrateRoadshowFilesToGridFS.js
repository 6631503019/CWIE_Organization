require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Roadshow = require('../models/Roadshow');
const { resolveStoredPath } = require('../utils/fileCleanup');
const { uploadRoadshowImageToGridFS, deleteGridFSFile } = require('../config/gridfs');

const migrate = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const records = await Roadshow.find({
        $or: [
            { poster_path: { $exists: true, $nin: ['', null] } },
            { activity_image_paths: { $exists: true, $not: { $size: 0 } } }
        ]
    });

    const result = {
        migrated: 0,
        missing: 0,
        failed: 0,
        total: records.length,
        migratedIds: [],
        missingIds: [],
        failedIds: []
    };

    for (const roadshow of records) {
        let changed = false;
        const newlyUploadedIds = [];

        if (roadshow.poster_path && !roadshow.poster_gridfs_id) {
            const absolutePath = resolveStoredPath(roadshow.poster_path);
            if (!absolutePath || !fs.existsSync(absolutePath)) {
                result.missing++;
                if (!result.missingIds.includes(String(roadshow._id))) result.missingIds.push(String(roadshow._id));
            } else {
                const file = {
                    path: absolutePath,
                    originalname: path.basename(absolutePath),
                    size: fs.statSync(absolutePath).size,
                    mimetype: 'image/jpeg'
                };
                try {
                    const id = await uploadRoadshowImageToGridFS(file, { roadshowId: String(roadshow._id), kind: 'poster' });
                    roadshow.poster_gridfs_id = id;
                    newlyUploadedIds.push(id);
                    changed = true;
                } catch (error) {
                    result.failed++;
                    if (!result.failedIds.includes(String(roadshow._id))) result.failedIds.push(String(roadshow._id));
                }
            }
        }

        const activityPaths = Array.isArray(roadshow.activity_image_paths) ? roadshow.activity_image_paths : [];
        if (!Array.isArray(roadshow.activity_gridfs_ids)) roadshow.activity_gridfs_ids = [];
        for (let index = 0; index < activityPaths.length; index++) {
            if (roadshow.activity_gridfs_ids[index]) continue;
            const absolutePath = resolveStoredPath(activityPaths[index]);
            if (!absolutePath || !fs.existsSync(absolutePath)) {
                result.missing++;
                if (!result.missingIds.includes(String(roadshow._id))) result.missingIds.push(String(roadshow._id));
                continue;
            }
            const file = {
                path: absolutePath,
                originalname: path.basename(absolutePath),
                size: fs.statSync(absolutePath).size,
                mimetype: 'image/jpeg'
            };
            try {
                const id = await uploadRoadshowImageToGridFS(file, { roadshowId: String(roadshow._id), kind: 'activity', index });
                roadshow.activity_gridfs_ids[index] = id;
                newlyUploadedIds.push(id);
                changed = true;
            } catch (error) {
                result.failed++;
                if (!result.failedIds.includes(String(roadshow._id))) result.failedIds.push(String(roadshow._id));
            }
        }

        if (changed) {
            try {
                await roadshow.save();
                result.migrated++;
                if (!result.migratedIds.includes(String(roadshow._id))) result.migratedIds.push(String(roadshow._id));
            } catch (error) {
                result.failed++;
                if (!result.failedIds.includes(String(roadshow._id))) result.failedIds.push(String(roadshow._id));
                await Promise.all(newlyUploadedIds.map(id =>
                    id ? deleteGridFSFile(id, 'roadshowFiles').catch(() => undefined) : undefined
                ));
            }
        }
    }

    console.log(JSON.stringify(result));
    await mongoose.disconnect();
};

migrate().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
