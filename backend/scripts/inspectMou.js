require('dotenv').config();
const mongoose = require('mongoose');
const MOU = require('../models/MOU');

const id = process.argv[2];
if (!id) {
    console.error('Usage: npm run inspect:mou -- <mouId>');
    process.exit(1);
}

const inspect = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const mou = await MOU.findById(id).lean();
    if (!mou) {
        console.log(JSON.stringify({ found: false, mouId: id }));
        await mongoose.disconnect();
        return;
    }
    console.log(JSON.stringify({
        found: true,
        mouId: String(mou._id),
        mou_file_path: mou.mou_file_path || null,
        mou_gridfs_id: mou.mou_gridfs_id ? String(mou.mou_gridfs_id) : null,
        mou_original_name: mou.mou_original_name || null,
        mou_file_size: mou.mou_file_size || null
    }));
    await mongoose.disconnect();
};

inspect().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
