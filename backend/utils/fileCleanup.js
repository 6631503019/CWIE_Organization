const fs = require('fs');
const path = require('path');
const { configuredUploadRoot, uploadDirectories } = require('../config/uploads');

const normalizeStoredPath = (storedPath) => {
    if (!storedPath || typeof storedPath !== 'string') {
        return null;
    }

    return storedPath.replace(/\\/g, '/').replace(/^\/+/, '');
};

const resolveStoredPath = (storedPath) => {
    const normalized = normalizeStoredPath(storedPath);

    if (!normalized) {
        return null;
    }

    if (normalized.startsWith('uploads/')) {
        const relativeToUploadRoot = normalized.slice('uploads/'.length);
        return path.resolve(configuredUploadRoot, relativeToUploadRoot);
    }

    for (const directory of Object.values(uploadDirectories)) {
        if (normalized.startsWith(path.basename(directory) + '/')) {
            return path.resolve(directory, normalized.split('/').slice(1).join('/'));
        }
    }

    return path.resolve(configuredUploadRoot, normalized);
};

const deleteStoredFile = (storedPath, logLabel = 'file') => {
    const absolutePath = resolveStoredPath(storedPath);

    if (!absolutePath || !fs.existsSync(absolutePath)) {
        return false;
    }

    try {
        fs.unlinkSync(absolutePath);
        console.log(`✅ Deleted ${logLabel}: ${absolutePath}`);
        return true;
    } catch (error) {
        console.error(`⚠️ Failed to delete ${logLabel}:`, error.message);
        return false;
    }
};

module.exports = {
    normalizeStoredPath,
    resolveStoredPath,
    deleteStoredFile
};