const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name property'],
            unique: true,
            trim: true, // cut whitespaces
            maxlength: [
                40,
                'The tour name can only have 40 characters maximum',
            ],
            minlength: [5, 'The tour name must have at least 5 characters'],
            //validate: [validator.isAlpha, 'The name must only contain letters'],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message:
                    'Accepted difficulties are: easy, medium and difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'A rating must be between 1.0 to 5.0'],
            max: [5, 'A rating must be between 1.0 to 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price property'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function(val) {
                    return val < this.price;
                },
                message:
                    'Discount price ({VALUE}) should be below regular price',
            },
        },
        summary: {
            type: String,
            required: [true, 'A tour must have a description'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual properties doesn´t exist in the document
// but will be calculated on query
tourSchema.virtual('durationWeek').get(function() {
    return this.duration / 7;
});

// Pre document middleware fires before .create and .save but not .insertMany
// thus you have access to the this document
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// find hook gives the query
// exclude secret tours from any find method
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
    next();
});

// pipeline has the actual array of pipelines
// exclude secret tours from entering aggregate pipeline
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

// Post middleware after it was saved, you have access to the doc
// tourSchema.post('save', function(doc, next) {
//     console.log(doc);
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
