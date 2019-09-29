const AppError = require('../utils/AppError');

const handleCastErrorDB = err => {
    return new AppError(`Invalid id: ${err.value}`, 400);
};

const handleDuplicateDB = err => {
    // 1) Get field used that is duplicated
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    // 2) Return new Error
    return new AppError(
        `Duplicate field: ${value}. Please use another one!`,
        400
    );
};

const handleValidationErrorDB = err => {
    // Get all errors message from the error object
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}.`;
    return new AppError(message, 400);
};

const sendDevError = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        stack: err.stack,
        message: err.message,
    });
};

const sendProdError = (err, res) => {
    // If known problem then leak it
    console.log(err.isOperational);
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });

        // if a programing or unknown error leaks then don´t give it out
    } else {
        // 1) Log the error
        // eslint-disable-next-line no-console
        console.log('Error', err);

        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message:
                'Something went wrong. Please retry in 5 minutes or contact us',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'error';

    if (process.env.NODE_ENV === 'development') {
        return sendDevError(err, res);
        // eslint-disable-next-line no-else-return
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        if (err.name === 'CastError') error = handleCastErrorDB(error); // Invalid ID
        if (err.code === 11000) error = handleDuplicateDB(error);
        if (err.name === 'ValidationError')
            error = handleValidationErrorDB(error);

        sendProdError(error, res);
    }
};
