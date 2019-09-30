const User = require('../models/User');
const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
const asyncWrapper = require('../utils/asyncWrapper');

exports.getAllUsers = asyncWrapper(async (req, res) => {
    // Build query
    const query = new ApiFeatures(User.find(), req.query)
        .filter()
        .sort()
        .fields()
        .paginate();

    // Call query
    const users = await query.callQuery();

    // Send response
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});

exports.getUser = asyncWrapper(async (req, res, next) => {
    // Custom way to get data by id
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new AppError(
                `Could not find any user with the id: ${req.params.id}`,
                404
            )
        );
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

exports.postUser = asyncWrapper(async (req, res) => {
    const newUser = await User.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser,
        },
    });
});

exports.putUser = asyncWrapper(async (req, res, next) => {
    const {
        params: { id: _id },
        body,
    } = req;

    const query = await User.replaceOne({ _id }, { body });
    if (query.n === 0) {
        return next(
            new AppError(`Could not find any user with the id: ${_id}`, 404)
        );
    }

    const user = await User.findById(_id);

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

exports.patchUser = asyncWrapper(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // It returns the data
        runValidators: true,
    });

    if (!user) {
        return next(
            new AppError(
                `Could not find any user with the id: ${req.params.id}`,
                404
            )
        );
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

exports.deleteUser = asyncWrapper(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(
            new AppError(
                `Could not find any user with the id: ${req.params.id}`,
                404
            )
        );
    }

    res.status(204).end();
});
