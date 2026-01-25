const Notification = require('../models/Notification');
const { CustomError, ERROR_CODES } = require('../utils/customError');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Admin only
const getNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};

        // Filter by read status if specified
        if (req.query.read !== undefined) {
            filter.is_read = req.query.read === 'true';
        }

        const notifications = await Notification.find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate('requested_by', 'name email');

        const total = await Notification.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: notifications,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create notification
// @route   POST /api/notifications
// @access  Admin only
const createNotification = async (req, res, next) => {
    try {
        const { requested_by, requested_by_name, action, establishment_name, establishment_id } = req.body;

        if (!requested_by || !requested_by_name || !action || !establishment_name) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_REQUIRED_FIELDS_MISSING,
                'Missing required fields',
                { required: ['requested_by', 'requested_by_name', 'action', 'establishment_name'] }
            );
        }

        const notification = await Notification.create({
            requested_by,
            requested_by_name,
            action,
            establishment_name,
            establishment_id,
            date: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Admin only
const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);

        if (!notification) {
            throw new CustomError(
                ERROR_CODES.NOT_FOUND_NOTIFICATION,
                'Notification not found',
                { notificationId: req.params.id }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Admin only
const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { is_read: true },
            { new: true, runValidators: true }
        );

        if (!notification) {
            throw new CustomError(
                ERROR_CODES.NOT_FOUND_NOTIFICATION,
                'Notification not found',
                { notificationId: req.params.id }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    createNotification,
    deleteNotification,
    markAsRead
};
