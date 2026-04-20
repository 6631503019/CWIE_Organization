const express = require('express');
const {
    getRoadshows,
    getRoadshow,
    createRoadshow,
    updateRoadshow,
    deleteRoadshow
} = require('../controllers/roadshowController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
    .get(getRoadshows)
    .post(protect, authorize('admin'),
        upload.fields([
            { name: 'poster', maxCount: 1 },
            { name: 'activity_image', maxCount: 10 }
        ]),
        createRoadshow
    );

router.route('/:id')
    .get(optionalAuth, getRoadshow)
    .put(protect, authorize('admin'),
        upload.fields([
            { name: 'poster', maxCount: 1 },
            { name: 'activity_image', maxCount: 10 }
        ]),
        updateRoadshow
    )
    .delete(protect, authorize('admin'), deleteRoadshow);

module.exports = router;