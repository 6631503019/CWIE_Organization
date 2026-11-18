const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} = require('@aws-sdk/client-s3');

const isR2Configured = () =>
    Boolean(
        process.env.R2_ACCOUNT_ID &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET_NAME
    );

const getR2Client = () => {
    if (!isR2Configured()) return null;
    return new S3Client({
        region: process.env.R2_REGION || 'auto',
        endpoint: process.env.R2_ENDPOINT ||
            `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
        }
    });
};

const getObjectKey = (originalName = 'document.pdf') => {
    const extension = path.extname(originalName).toLowerCase() === '.pdf'
        ? '.pdf'
        : '.pdf';
    const random = crypto.randomBytes(12).toString('hex');
    return `mou/${Date.now()}-${random}${extension}`;
};

const uploadMouFile = async file => {
    if (!isR2Configured()) return null;

    const objectKey = getObjectKey(file.originalname);
    const client = getR2Client();
    await client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: objectKey,
        Body: fs.createReadStream(file.path),
        ContentType: 'application/pdf',
        ContentDisposition: 'inline; filename="mou.pdf"',
        Metadata: {
            originalName: path.basename(file.originalname).slice(0, 200)
        }
    }));

    return {
        provider: 'r2',
        objectKey,
        originalName: file.originalname,
        size: file.size
    };
};

const getMouObject = async objectKey => {
    const client = getR2Client();
    if (!client || !isR2Configured()) {
        throw new Error('R2 storage is not configured');
    }
    return client.send(new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: objectKey
    }));
};

const deleteMouObject = async objectKey => {
    const client = getR2Client();
    if (!client || !objectKey) return false;
    await client.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: objectKey
    }));
    return true;
};

module.exports = {
    isR2Configured,
    getObjectKey,
    uploadMouFile,
    getMouObject,
    deleteMouObject
};
