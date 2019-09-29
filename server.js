const dotenv = require('dotenv');
const mongoose = require('mongoose');
// Config file
dotenv.config({ path: './config.env' });
const app = require('./app');

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
    })
    .then(() => console.log(`DB connection successfull`));

// Server listening
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () =>
    console.log(`http server listening in port ${PORT}...`)
);

// Global promise rejection handle safety net
process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLE REJECTION: shutting down...');

    // Gracefully close server and then exit node
    server.close(() => {
        process.exit(1); // 0 success 1 uncaught exception
    });
});

// Global promise rejection handle safety net
/*process.on('uncaught', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLE REJECTION: shutting down...');

  // Gracefully close server and then exit node
  server.close(() => {
      process.exit(1); // 0 success 1 uncaught exception
  });
});*/
