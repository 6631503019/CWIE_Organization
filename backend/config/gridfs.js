const mongoose = require('mongoose');
const fs = require('fs');
const { Readable } = require('stream');

const getBucket = () => {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
        const error = new Error('MongoDB connection is unavailable');
        error.code = 'DATABASE_UNAVAILABLE';
        throw error;
    }
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'mouFiles' });
};

const uploadPdfToGridFS = (file, metadata = {}) => {
    return new Promise((resolve, reject) => {
        const bucket = getBucket();
        const uploadStream = bucket.openUploadStream(file.originalname, {
            contentType: 'application/pdf',
            metadata: {
                originalName: file.originalname,
                size: file.size,
                ...metadata
            }
        });

        const source = file.buffer
            ? Readable.from(file.buffer)
            : fs.createReadStream(file.path);
        source
            .on('error', reject)
            .pipe(uploadStream)
            .on('error', reject)
            .on('finish', () => resolve(uploadStream.id));
    });
};

const openGridFSFile = async fileId => {
    const bucket = getBucket();
    const objectId = mongoose.Types.ObjectId.isValid(fileId)
        ? new mongoose.Types.ObjectId(fileId)
        : null;
    if (!objectId) {
        const error = new Error('Invalid GridFS file ID');
        error.code = 'INVALID_GRIDFS_ID';
        throw error;
    }

    const files = await bucket.find({ _id: objectId }).limit(1).toArray();
    if (!files.length) {
        const error = new Error('GridFS file not found');
        error.code = 'GRIDFS_FILE_NOT_FOUND';
        throw error;
    }
    return {
        file: files[0],
        stream: bucket.openDownloadStream(objectId)
    };
};

const deleteGridFSFile = async fileId => {
    if (!mongoose.Types.ObjectId.isValid(fileId)) return false;
    const bucket = getBucket();
    await bucket.delete(new mongoose.Types.ObjectId(fileId));
    return true;
};

module.exports = {
    getBucket,
    uploadPdfToGridFS,
    openGridFSFile,
    deleteGridFSFile
};
