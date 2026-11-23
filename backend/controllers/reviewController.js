const Review = require('../models/Review');
const InternshipRecord = require('../models/InternshipRecord');
const { CustomError, createNotFoundError, ERROR_CODES } = require('../utils/customError');

const normalizeReviewValue = value => String(value ?? '').trim();
const getReviewOrganizationId = review => {
    const organization = review?.organization_id;
    if (!organization) return '';
    if (typeof organization === 'object' && organization._id) return String(organization._id);
    return String(organization);
};

const enrichReviewsWithInternshipPeriod = async reviews => {
    const reviewPairs = reviews
        .map(review => ({
            studentId: normalizeReviewValue(review.student_id),
            organizationId: getReviewOrganizationId(review)
        }))
        .filter(pair => pair.studentId && pair.organizationId);

    if (!reviewPairs.length) return reviews;

    const uniquePairs = Array.from(new Map(
        reviewPairs.map(pair => [`${pair.studentId}\u0000${pair.organizationId}`, pair])
    ).values());
    const internshipRecords = await InternshipRecord.find({
        record_type: 'internship',
        $or: uniquePairs.map(pair => ({
            student_id: pair.studentId,
            organization_id: pair.organizationId
        }))
    }).select('student_id organization_id academic_year semester source_sheet source_row').lean();

    const recordsByPair = new Map();
    internshipRecords.forEach(record => {
        const key = `${normalizeReviewValue(record.student_id)}\u0000${String(record.organization_id || '')}`;
        const records = recordsByPair.get(key) || [];
        records.push(record);
        recordsByPair.set(key, records);
    });

    return reviews.map(review => {
        const key = `${normalizeReviewValue(review.student_id)}\u0000${getReviewOrganizationId(review)}`;
        const candidates = recordsByPair.get(key) || [];
        const sourceMatchedCandidates = review.source_sheet && review.source_row
            ? candidates.filter(record =>
                record.source_sheet === review.source_sheet &&
                Number(record.source_row) === Number(review.source_row)
            )
            : [];
        const verifiedCandidates = sourceMatchedCandidates.length === 1
            ? sourceMatchedCandidates
            : candidates;
        const resolveUnambiguousValue = field => {
            const values = Array.from(new Set(
                verifiedCandidates.map(record => normalizeReviewValue(record[field])).filter(Boolean)
            ));
            return values.length === 1 ? values[0] : '';
        };

        const enriched = { ...review };
        if (!normalizeReviewValue(enriched.academic_year)) {
            enriched.academic_year = resolveUnambiguousValue('academic_year');
        }
        if (!normalizeReviewValue(enriched.semester)) {
            enriched.semester = resolveUnambiguousValue('semester');
        }
        return enriched;
    });
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getAllReviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const skip = (page - 1) * limit;

        const reviews = await Review.find()
            .populate('organization_id', 'organization_name_en organization_name_th')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const enrichedReviews = await enrichReviewsWithInternshipPeriod(reviews);

        const total = await Review.countDocuments();

        res.status(200).json({
            success: true,
            message: 'All reviews retrieved successfully',
            data: enrichedReviews,
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
        const organization = await InternshipRecord.findOne({ _id: organizationId, record_type: 'organization' });
        if (!organization) {
            throw createNotFoundError('organization', organizationId);
        }

        const reviews = await Review.find({ organization_id: organizationId })
            .populate('organization_id', 'organization_name_en organization_name_th')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const enrichedReviews = await enrichReviewsWithInternshipPeriod(reviews);

        const total = await Review.countDocuments({ organization_id: organizationId });

        res.status(200).json({
            success: true,
            message: 'Reviews retrieved successfully',
            data: enrichedReviews,
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
        const { organization_id, job_position, review_text, rating, academic_year, semester } = req.body;

        // Check required fields
        const requiredFields = ['organization_id', 'job_position', 'review_text'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
                'Missing required fields',
                { missingFields }
            );
        }

        // Validate rating range if provided
        if (rating && (rating < 1 || rating > 5)) {
            throw new CustomError(
                ERROR_CODES.VALIDATION_INVALID_RANGE,
                'Rating must be between 1 and 5',
                { field: 'rating', value: rating }
            );
        }

        // Check if organization exists
        const organization = await InternshipRecord.findOne({ _id: organization_id, record_type: 'organization' });
        if (!organization) {
            throw createNotFoundError('organization', organization_id);
        }

        const review = await Review.create({ ...req.body, academic_year, semester });

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