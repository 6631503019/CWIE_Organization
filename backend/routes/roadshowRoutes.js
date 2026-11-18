const express = require('express');
const {
    getRoadshows,
    getRoadshow,
    createRoadshow,
    updateRoadshow,
    deleteRoadshow,
    getRoadshowPoster,
    getRoadshowActivityImage
} = require('../controllers/roadshowController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadRoadshow = upload.uploadRoadshow;

const router = express.Router();

router.route('/')
    .get(getRoadshows)
    .post(protect, authorize('admin'),
        uploadRoadshow.fields([
            { name: 'poster', maxCount: 1 },
            { name: 'activity_image', maxCount: 10 }
        ]),
        createRoadshow
    );

router.get('/:id/image/poster', optionalAuth, getRoadshowPoster);
router.get('/:id/image/activity/:index', optionalAuth, getRoadshowActivityImage);

router.route('/:id')
    .get(optionalAuth, getRoadshow)
    .put(protect, authorize('admin'),
        uploadRoadshow.fields([
            { name: 'poster', maxCount: 1 },
            { name: 'activity_image', maxCount: 10 }
        ]),
        updateRoadshow
    )
    .delete(protect, authorize('admin'), deleteRoadshow);

module.exports = router;