const fs = require('fs');
const path = require('path');

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

    return path.resolve(__dirname, '..', normalized);
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