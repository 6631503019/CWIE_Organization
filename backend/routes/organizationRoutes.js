const express = require('express');
const {
    getOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationLogo
} = require('../controllers/organizationController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
    .get(getOrganizations)
    .post(protect, authorize('admin'), upload.single('logo'), createOrganization);

router.route('/:id')
    .get(optionalAuth, getOrganization)
    .put(protect, authorize('admin'), upload.single('logo'), updateOrganization)
    .delete(protect, authorize('admin'), deleteOrganization);

router.get('/:id/logo', optionalAuth, getOrganizationLogo);

module.exports = router;