const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Config file
dotenv.config({ path: './config.env' });
const app = require('./app');

// Global exception failure handle safety net
process.on('uncaughtException', err => {
    // eslint-disable-next-line no-console
    console.log('UNHANDLE EXCEPTION: shutting down...');
    // eslint-disable-next-line no-console
    console.log(err.name, err.message);

    process.exit(1); // 0 success 1 uncaught exception
});

// Using SET NODE_ENV writes a whitespace at the end, so trim it
if (process.env.NODE_ENV.trim() === 'production') {
    process.env.NODE_ENV = process.env.NODE_ENV.trim();
}

// Check NODE_ENV is set
if (!process.env.NODE_ENV) {
    throw new Error(
        'NODE_ENV must be set in the enviroment variables for this program to work'
    );
}
if (
    !(
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'production'
    )
) {
    throw new Error(
        `NODE_ENV enviroment variable can only accept two values: development and production. Actual NODE_ENV is ${process.env.NODE_ENV}`
    );
}

// Database connection
const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    }) // eslint-disable-next-line no-console
    .then(() => console.log(`DB connection successfull`));

// Server listening
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () =>
    // eslint-disable-next-line no-console
    console.log(`http server listening in port ${PORT}...`)
);

// Global unhandle promise failure safety net
process.on('unhandledRejection', err => {
    // eslint-disable-next-line no-console
    console.log('UNHANDLE REJECTION: shutting down...');
    // eslint-disable-next-line no-console
    console.log(err.name, err.message);

    // Gracefully close server and then exit node
    server.close(() => {
        process.exit(1); // 0 success 1 uncaught exception
    });
});
