const fs = require('fs');
const path = require('path');

const backendRoot = path.resolve(__dirname, '..');

const configuredUploadRoot = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(backendRoot, 'uploads');

const uploadDirectories = {
    root: configuredUploadRoot,
    logos: path.join(configuredUploadRoot, 'logos'),
    mou: path.join(configuredUploadRoot, 'mou'),
    posters: path.join(configuredUploadRoot, 'posters'),
    activities: path.join(configuredUploadRoot, 'activities'),
    imports: path.join(configuredUploadRoot, 'imports')
};

Object.values(uploadDirectories).forEach(directory => {
    fs.mkdirSync(directory, { recursive: true });
});

const getPublicUploadPath = (category, filename) => {
    return `/uploads/${category}/${filename}`;
};

const migrateLegacyUploadFiles = () => {
    const legacyRoot = path.join(backendRoot, 'uploads');
    if (path.resolve(legacyRoot) === path.resolve(configuredUploadRoot)) return;

    for (const category of ['logos', 'mou', 'posters', 'activities', 'imports']) {
        const sourceDir = path.join(legacyRoot, category);
        const targetDir = uploadDirectories[category];
        if (!fs.existsSync(sourceDir)) continue;

        for (const filename of fs.readdirSync(sourceDir)) {
            const sourcePath = path.join(sourceDir, filename);
            const targetPath = path.join(targetDir, filename);
            if (fs.statSync(sourcePath).isFile() && !fs.existsSync(targetPath)) {
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
    }
};

module.exports = {
    backendRoot,
    uploadDirectories,
    configuredUploadRoot,
    getPublicUploadPath,
    migrateLegacyUploadFiles
};
