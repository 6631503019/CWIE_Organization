const express = require('express');
const {
    getRoadshows,
    getRoadshow,
    createRoadshow,
    updateRoadshow,
    deleteRoadshow
} = require('../controllers/roadshowController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
    .get(getRoadshows)
    .post(protect, authorize('admin'),
        upload.fields([
            { name: 'poster', maxCount: 1 },
            { name: 'activity_image', maxCount: 1 }
        ]),
        createRoadshow
    );

router.route('/:id')
    .get(protect, getRoadshow)
    .put(protect, authorize('admin'),
        upload.fields([
            { name: 'poster', maxCount: 1 },
            { name: 'activity_image', maxCount: 1 }
        ]),
        updateRoadshow
    )
    .delete(protect, authorize('admin'), deleteRoadshow);

module.exports = router;