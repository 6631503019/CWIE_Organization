const express = require('express');
const {
    getNotifications,
    createNotification,
    deleteNotification,
    markAsRead
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin'), getNotifications)
    .post(protect, authorize('admin'), createNotification);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteNotification);

router.route('/:id/read')
    .patch(protect, authorize('admin'), markAsRead);

module.exports = router;
