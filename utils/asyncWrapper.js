// This utility functions returns the callback function
// asuming it is an async function, this way the catch
// method will handle errors instead of declaring a
// try catch block
module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
