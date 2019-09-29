const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../models/Tour');

// Config file
dotenv.config({ path: './config.env' });

// Database connection
const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then(() => console.log(`DB connection successfull`))
    .catch(err => console.log(`DB connection failed: ${err}`));

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/data/tours-simple.json`, 'utf-8')
);

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data succesfully loaded');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// Delete all data
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data succesfully deleted');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const getSelect = async () => {
    try {
        await Tour.find().select('name');
        console.log(
            await Tour.find({ price: { $gte: 500 } })
                .sort('name')
                .select('name')
        );
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

console.log(process.argv);
console.log(process.argv.includes('--delete'));

if (process.argv.includes('--import')) {
    importData();
} else if (process.argv.includes('--delete')) {
    deleteData();
} else if (process.argv.includes('--select')) {
    getSelect();
}
