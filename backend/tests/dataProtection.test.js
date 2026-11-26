const assert = require('node:assert/strict');
const { test } = require('node:test');
const Review = require('../models/Review');
const InternshipRecord = require('../models/InternshipRecord');
const Roadshow = require('../models/Roadshow');
const reviewController = require('../controllers/reviewController');
const organizationController = require('../controllers/organizationController');
const roadshowController = require('../controllers/roadshowController');
const { toOrganizationResponse } = require('../utils/organizationRecord');
const { errorHandler, notFound } = require('../middleware/errorHandler');

const ORGANIZATION_ID = 'organization-1';
const privateReview = {
    _id: 'review-1',
    organization_id: {
        _id: ORGANIZATION_ID,
        organization_name_en: 'Example Organization',
        organization_name_th: 'ตัวอย่าง',
        student_name: 'Private Student Name'
    },
    job_position: 'Intern',
    academic_year: '',
    semester: '',
    review_text: 'A useful review from Private Student Name, id private-student-id',
    rating: 5,
    student_id: 'private-student-id',
    student_name: 'Private Student Name',
    review_data: { supervisor: 'Private Supervisor', student_email: 'private@example.test' },
    source_sheet: 'Review 2024',
    source_row: 4,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z')
};

class FakeQuery {
    constructor(value) {
        this.value = value;
    }

    populate() { return this; }
    sort() { return this; }
    skip() { return this; }
    limit() { return this; }
    select() { return this; }
    lean() { return Promise.resolve(this.value); }
    then(resolve, reject) { return Promise.resolve(this.value).then(resolve, reject); }
}

const invokeController = async (handler, req) => {
    const res = {
        statusCode: null,
        body: null,
        setHeader() {
            return this;
        },
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
    let controllerError;
    await handler(req, res, error => { controllerError = error; });
    return { res, controllerError };
};

test('public review endpoints retain review fields and relationships but omit student data', async t => {
    const originalReviewFind = Review.find;
    const originalReviewCountDocuments = Review.countDocuments;
    const originalInternshipFind = InternshipRecord.find;
    const originalInternshipFindOne = InternshipRecord.findOne;
    t.after(() => {
        Review.find = originalReviewFind;
        Review.countDocuments = originalReviewCountDocuments;
        InternshipRecord.find = originalInternshipFind;
        InternshipRecord.findOne = originalInternshipFindOne;
    });

    Review.find = () => new FakeQuery([privateReview]);
    Review.countDocuments = async () => 1;
    InternshipRecord.find = () => new FakeQuery([{
        student_id: privateReview.student_id,
        organization_id: ORGANIZATION_ID,
        academic_year: '2024',
        semester: '1'
    }]);
    InternshipRecord.findOne = async () => ({ _id: ORGANIZATION_ID });

    const responses = [];
    responses.push(await invokeController(reviewController.getAllReviews, {
        query: { page: '1', limit: '10' }
    }));
    responses.push(await invokeController(reviewController.getReviews, {
        params: { organizationId: ORGANIZATION_ID },
        query: { page: '1', limit: '10' }
    }));

    for (const { res, controllerError } of responses) {
        assert.ifError(controllerError);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body.data[0], {
            _id: 'review-1',
            organization_id: {
                _id: ORGANIZATION_ID,
                organization_name_en: 'Example Organization',
                organization_name_th: 'ตัวอย่าง'
            },
            job_position: 'Intern',
            academic_year: '2024',
            semester: '1',
            review_text: 'A useful review from [redacted], id [redacted]',
            rating: 5,
            createdAt: privateReview.createdAt,
            updatedAt: privateReview.updatedAt
        });
        assert.equal(res.body.pagination.total, 1);
        assert.equal(res.body.pagination.page, 1);
        assert.doesNotMatch(JSON.stringify(res.body), /student|supervisor|private@example\.test/i);
    }

    const unpopulatedRelation = reviewController.serializePublicReview({
        ...privateReview,
        organization_id: { _id: ORGANIZATION_ID, student_name: 'Private Student Name' }
    });
    assert.equal(unpopulatedRelation.organization_id, ORGANIZATION_ID);
    assert.doesNotMatch(JSON.stringify(unpopulatedRelation), /student/i);
});

test('organization serialization strips retained student fields', () => {
    const response = toOrganizationResponse({
        _id: ORGANIZATION_ID,
        organization_name_en: 'Example Organization',
        student_id: 'private-student-id',
        student_name_th: 'Private Student Name',
        student_name_en: 'Private Student Name',
        major_th: 'Private Major',
        major_en: 'Private Major'
    });

    assert.equal(response.name_en, 'Example Organization');
    assert.doesNotMatch(JSON.stringify(response), /student|private major/i);
});

test('private organization and roadshow lists reject unauthenticated callers', async () => {
    const req = { query: { public: 'false' } };
    const organizationResult = await invokeController(organizationController.getOrganizations, req);
    const roadshowResult = await invokeController(roadshowController.getRoadshows, req);

    assert.equal(organizationResult.controllerError.statusCode, 403);
    assert.equal(roadshowResult.controllerError.statusCode, 403);
});

test('administrator can retrieve private organization and roadshow lists', async t => {
    const originalInternshipFind = InternshipRecord.find;
    const originalInternshipCountDocuments = InternshipRecord.countDocuments;
    const originalRoadshowFind = Roadshow.find;
    const originalRoadshowCountDocuments = Roadshow.countDocuments;
    t.after(() => {
        InternshipRecord.find = originalInternshipFind;
        InternshipRecord.countDocuments = originalInternshipCountDocuments;
        Roadshow.find = originalRoadshowFind;
        Roadshow.countDocuments = originalRoadshowCountDocuments;
    });

    InternshipRecord.find = () => new FakeQuery([{
        _id: ORGANIZATION_ID,
        record_type: 'organization',
        organization_name_en: 'Private Organization',
        is_public: false
    }]);
    InternshipRecord.countDocuments = async () => 1;
    Roadshow.find = () => new FakeQuery([{ _id: 'roadshow-1', is_public: false }]);
    Roadshow.countDocuments = async () => 1;

    const req = { query: { public: 'false' }, user: { role: 'admin' } };
    const organizationResult = await invokeController(organizationController.getOrganizations, req);
    const roadshowResult = await invokeController(roadshowController.getRoadshows, req);

    assert.ifError(organizationResult.controllerError);
    assert.ifError(roadshowResult.controllerError);
    assert.equal(organizationResult.res.statusCode, 200);
    assert.equal(roadshowResult.res.statusCode, 200);
    assert.equal(organizationResult.res.body.data[0].is_public, false);
    assert.equal(roadshowResult.res.body.data[0].is_public, false);
});

test('internal errors do not log or return request secrets or student identifiers', () => {
    const originalConsoleError = console.error;
    const logged = [];
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
    console.error = (...args) => logged.push(JSON.stringify(args));

    try {
        errorHandler(
            new Error('mongodb://username:password@database.example/private?token=secret'),
            {
                path: '/api/reviews',
                method: 'POST',
                body: { student_id: 'private-student-id', idToken: 'private-firebase-token' },
                query: { student_name: 'Private Student Name' },
                params: {}
            },
            res,
            () => {}
        );
    } finally {
        console.error = originalConsoleError;
    }

    const logOutput = logged.join('');
    assert.equal(res.statusCode, 500);
    assert.equal(res.body.message, 'Something went wrong');
    assert.doesNotMatch(logOutput, /username|password|database\.example|secret|student|private-firebase-token/i);
    assert.doesNotMatch(JSON.stringify(res.body), /database\.example|student|private-firebase-token/i);

    const notFoundResponse = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
    notFound({ originalUrl: '/missing?token=private-firebase-token', method: 'GET' }, notFoundResponse);
    assert.equal(notFoundResponse.body.message, 'Route not found');
    assert.doesNotMatch(JSON.stringify(notFoundResponse.body), /private-firebase-token|missing/i);
});
