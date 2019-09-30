const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const errorController = require('./controllers/errorController');

const app = express();

// Middlewares

// Custom Loggin middleware
/* app.use("*", (req, res, next) => {
  console.log(`Got request for: ${req.url}`);
  next();
}); */

// Logger middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Express.json creares req.body
app.use(express.json());

// Static directory
app.use(express.static(`${__dirname}/public`));

// Routers
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Error management
app.all('*', (req, res, next) => {
    // Llamar next con un argumento se entiende como un error
    next(new AppError(`Can´t find ${req.originalUrl}`, 404));
});

app.use(errorController);

module.exports = app;
