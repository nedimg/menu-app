const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;


// create a schema
const userSchema = new Schema({
    email: { type: String, required: true, unique: true, minlength: 6, lowercase: true },
    password: String,
    social: Array,
    createdAt: Date,
    updatedAt: Date,
}, {
    versionKey: false,
});

const MIN_PASSWORD_LENGTH = 8;

userSchema.methods.setPassword = function(rawPassword, done) {
    const clean = rawPassword.trim();
    if (clean.length >= MIN_PASSWORD_LENGTH) {
        bcrypt
            .hash(clean, 10)
            .then(password => {
                this.password = password;
                done();
            }, err => {
                done(new Error(err));
            });
    } else {
        done(new Error(`Password to short. Minimal length is ${MIN_PASSWORD_LENGTH}`));
    }
};


// on every save, add the date
userSchema.pre('save', function(next) {
    const user = this;

    // get the current date
    const currentDate = new Date();

    // change the updated_at field to current date
    user.updatedAt = currentDate;

    if (user.isNew) {
        user.createdAt = currentDate;
        if (user.password) {
            user.setPassword(user.password, err => next(err));
        } else {
            next();
        }
    } else {
        next();
    }
});

// the schema is useless so far
// we need to create a model using it
const User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
