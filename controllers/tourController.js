const Tour = require('../models/Tour');
const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
const asyncWrapper = require('../utils/asyncWrapper');

exports.getBestTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'ratingsAverage,price';
    req.query.fields = 'name,price,duration,summary,difficulty';
    next();
};

exports.getTours = asyncWrapper(async (req, res) => {
    // Build query
    const query = new ApiFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .fields()
        .paginate();

    // Call query
    const tours = await query.callQuery();

    // Send response
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours,
        },
    });
});

exports.getTour = asyncWrapper(async (req, res, next) => {
    // Custom way to get data by id
    // const tour = await Tour.findOne({ _id: req.params.id });
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
        return next(
            new AppError(
                `Could not find any Tour with the id: ${req.params.id}`,
                404
            )
        );
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.postTour = asyncWrapper(async (req, res) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour,
        },
    });
});

exports.putTour = asyncWrapper(async (req, res, next) => {
    const {
        params: { id: _id },
        body,
    } = req;

    const query = await Tour.replaceOne({ _id }, { body });
    if (query.n === 0) {
        return next(
            new AppError(`Could not find any Tour with the id: ${_id}`, 404)
        );
    }

    const tour = await Tour.findById(_id);

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.patchTour = asyncWrapper(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // It returns the data
        runValidators: true,
    });

    if (!tour) {
        return next(
            new AppError(
                `Could not find any Tour with the id: ${req.params.id}`,
                404
            )
        );
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.deleteTour = asyncWrapper(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(
            new AppError(
                `Could not find any Tour with the id: ${req.params.id}`,
                404
            )
        );
    }

    res.status(204).end();
});

exports.getTourStats = asyncWrapper(async (req, res) => {
    const stat = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                averageRating: { $avg: '$ratingsAverage' },
                averagePrice: { $avg: '$price' },
                minPrice: { $avg: '$price' },
                maxPrice: { $avg: '$price' },
            },
        },
        {
            $sort: { averageRating: 1 },
        },
        /* {
            $match: { _id: { $ne: 'EASY' } },
        }, */
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stat,
        },
    });
});

exports.getTourPlans = asyncWrapper(async (req, res) => {
    // Get year parameter
    const { year } = req.params;

    // Build aggregation
    // unwind creates copies of a document but with
    // a diferent value of an array
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTours: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: { _id: 0 },
        },
        {
            $sort: { numTours: -1 },
        },
        {
            $limit: 12,
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan,
        },
    });
});
