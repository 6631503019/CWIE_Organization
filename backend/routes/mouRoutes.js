const express = require('express');
const {
    getMOUs,
    getMOU,
    createMOU,
    updateMOU,
    deleteMOU,
    getMOUFile
} = require('../controllers/mouController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
    .get(optionalAuth, getMOUs)
    .post(protect, authorize('admin'), upload.single('mou'), createMOU);

router.get('/:id/file', optionalAuth, getMOUFile);

router.route('/:id')
    .get(optionalAuth, getMOU)
    .put(protect, authorize('admin'), upload.single('mou'), updateMOU)
    .delete(protect, authorize('admin'), deleteMOU);

module.exports = router;