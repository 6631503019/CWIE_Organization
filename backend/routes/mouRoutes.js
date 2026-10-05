const express = require('express');
const {
    getMOUs,
    getMOU,
    createMOU,
    updateMOU,
    deleteMOU
} = require('../controllers/mouController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
    .get(getMOUs)
    .post(protect, authorize('admin'), upload.single('mou'), createMOU);

router.route('/:id')
    .get(getMOU)
    .put(protect, authorize('admin'), upload.single('mou'), updateMOU)
    .delete(protect, authorize('admin'), deleteMOU);

module.exports = router;