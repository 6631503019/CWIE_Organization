const Review = require('../models/Review');
const Organization = require('../models/Organization');
const { CustomError, createNotFoundError, ERROR_CODES } = require('../utils/customError');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getAllReviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const skip = (page - 1) * limit;

        const reviews = await Review.find()
            .populate('organization_id', 'name_en name_th')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments();

        res.status(200).json({
            success: true,
            message: 'All reviews retrieved successfully',
            data: reviews,
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

// @desc    Get reviews for an organization
// @route   GET /api/reviews/organization/:organizationId
// @access  Public
const getReviews = async (req, res, next) => {
    try {
        const { organizationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Check if organization exists
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            throw createNotFoundError('organization', organizationId);
        }

        const reviews = await Review.find({ organization_id: organizationId })
            .populate('organization_id', 'name_en name_th')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ organization_id: organizationId });

        res.status(200).json({
            success: true,
            message: 'Reviews retrieved successfully',
            data: reviews,
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

// @desc    Create a review
// @route   POST /api/reviews
// @access  Public
const createReview = async (req, res, next) => {
    try {
        const { organization_id, job_position, review_text, rating } = req.body;

        // Check required fields
        const requiredFields = ['organization_id', 'job_position', 'review_text', 'rating'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
                'Missing required fields',
                { missingFields }
            );
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_INVALID_RANGE,
                'Rating must be between 1 and 5',
                { field: 'rating', value: rating }
            );
        }

        // Check if organization exists
        const organization = await Organization.findById(organization_id);
        if (!organization) {
            throw createNotFoundError('organization', organization_id);
        }

        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Admin)
const updateReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            throw createNotFoundError('review', req.params.id);
        }

        // Validate rating if provided
        if (req.body.rating && (req.body.rating < 1 || req.body.rating > 5)) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_INVALID_RANGE,
                'Rating must be between 1 and 5',
                { field: 'rating', value: req.body.rating }
            );
        }

        const updatedReview = await Review.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: updatedReview
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin)
const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            throw createNotFoundError('review', req.params.id);
        }

        await Review.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllReviews,
    getReviews,
    createReview,
    updateReview,
    deleteReview
};