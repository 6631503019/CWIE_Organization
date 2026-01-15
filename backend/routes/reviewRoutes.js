const express = require('express');
const {
    getReviews,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .post(createReview);

router.route('/organization/:organizationId')
    .get(getReviews);

router.route('/:id')
    .put(protect, authorize('admin'), updateReview)
    .delete(protect, authorize('admin'), deleteReview);

module.exports = router;