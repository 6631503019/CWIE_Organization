const express = require('express');
const {
    getOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization
} = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
    .get(getOrganizations)
    .post(protect, authorize('admin'), upload.single('logo'), createOrganization);

router.route('/:id')
    .get(protect, getOrganization)
    .put(protect, authorize('admin'), upload.single('logo'), updateOrganization)
    .delete(protect, authorize('admin'), deleteOrganization);

module.exports = router;