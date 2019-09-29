const express = require('express');

// Controller
const tourController = require('../controllers/tourController');

const router = express.Router();

/* router.param('id', tourController.checkID); */

// Alias
router
    .route('/best-tours')
    .get(tourController.getBestTours, tourController.getTours);

// Agregate pipeline stats
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/tour-plans/:year').get(tourController.getTourPlans);

router
    .route('/')
    .get(tourController.getTours)
    .post(tourController.postTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .put(tourController.putTour)
    .patch(tourController.patchTour)
    .delete(tourController.deleteTour);

module.exports = router;
