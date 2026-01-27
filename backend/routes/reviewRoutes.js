const express = require('express');
const {
    getAllReviews,
    getReviews,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getAllReviews)
    .post(createReview);

router.route('/organization/:organizationId')
    .get(getReviews);

router.route('/:id')
    .put(protect, authorize('admin'), updateReview)
    .delete(protect, authorize('admin'), deleteReview);

module.exports = router;