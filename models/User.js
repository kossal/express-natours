const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'All users requires a name property'],
            trim: true,
            maxlength: [60, 'The maximum length of a name is 60 characters'],
            minlength: [5, 'The minimum length of a name is 5 characters'],
            validate: [
                arg => validator.matches(arg, /^(?![\s.]+$)[a-zA-Z\s.]*$/),
                'The name must only contain letters',
            ],
        },
        email: {
            type: String,
            required: [true, 'All users requires a email property'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Invalid email format'],
        },
        photo: {
            type: String,
            validate: [validator.isURL, 'Invalid URL for photo'],
        },
        /* password: {
            type: String,
            required: [true, 'All users requires a password property'],
            validate: [
                arg => validator.isHash(arg, 'sha512'),
                'Invalid email format',
            ],
        }, */
        password: {
            type: String,
            required: [true, 'All users requires a password property'],
            minlength: 8,
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: true,
            validate: {
                // Only works on CREATE and SAVE
                validator: function(arg) {
                    return this.password === arg;
                },
                message: 'Passwords are not equal',
            },
            select: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Encrypt password
userSchema.pre('save', async function(next) {
    // Only run if password was modified
    if (!this.isModified('password')) return next();

    // 12 is the cost of bcrypt
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    next();
});

userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
