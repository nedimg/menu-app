const passport = require('passport');
const axios = require('axios');
const config = require('config');
const OAuthStrategy = require('passport-oauth2').Strategy;

const User = require('../models/user');

passport.initialize();

const facebookStrategy = new OAuthStrategy({
    clientID: config.get('facebook.clientID'),
    clientSecret: config.get('facebook.clientSecret'),
    callbackURL: config.get('facebook.callbackURL'),
    authorizationURL: config.get('facebook.authorizationUrl'),
    tokenURL: config.get('facebook.tokenUrl'),
    scope: ['public_profile', 'email'],
},
(token, refreshToken, profile, done) => {
    process.nextTick(() => {
        User
            .findOne({ email: profile.email })
            // .findOne({ social: { $elemMatch: { id: profile.id, provider: 'google' } } })
            .then(user => {
                const socialAuthData = {
                    token,
                    id: profile.id,
                    provider: 'facebook',
                };
                if (user) {
                    if (user.social.find(s => s.provider === 'facebook' && s.id === profile.id)) {
                        // user authenticated with google and profile.id
                        return done(null, user);
                    }
                    // user exists already. add social auth data into db
                    user.social.push(socialAuthData);
                    user.save(err => {
                        if (err) {
                            return done(null, false, { message: err });
                        }

                        return done(null, user);
                    });
                } else {
                    // first time user so create
                    const newUser = new User({
                        email: profile.email,
                        social: [socialAuthData],
                    });
                    // save the user
                    newUser.save(err => {
                        if (err) {
                            return done(null, false, { message: err });
                        }

                        return done(null, newUser);
                    });
                }
            });
    });
});

facebookStrategy.userProfile = (accessToken, done) => {
    axios
        .get(config.get('facebook.profileUrl'), {
            params: {
                access_token: accessToken,
                fields: ['id', 'email', 'name'].join(','),
            },
        })
        .then(response => {
            return done(null, response.data);
        });
};

passport.use('facebook', facebookStrategy);

const googleStrategy = new OAuthStrategy({
    clientID: config.get('google.clientID'),
    clientSecret: config.get('google.clientSecret'),
    callbackURL: config.get('google.callbackURL'),
    authorizationURL: config.get('google.authorizationUrl'),
    tokenURL: config.get('google.tokenUrl'),
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
}, (token, refreshToken, profile, done) => {
    process.nextTick(() => {
        User
            .findOne({ email: profile.email })
            // .findOne({ social: { $elemMatch: { id: profile.id, provider: 'google' } } })
            .then(user => {
                const socialAuthData = {
                    token,
                    id: profile.id,
                    provider: 'google',
                };
                if (user) {
                    if (user.social.find(s => s.provider === 'google' && s.id === profile.id)) {
                        // user authenticated with google and profile.id
                        return done(null, user);
                    }
                    // user exists already. add social auth data into db
                    user.social.push(socialAuthData);
                    user.save(err => {
                        if (err) {
                            return done(null, false, { message: err });
                        }

                        return done(null, user);
                    });
                }
                const newUser = new User({
                    email: profile.email,
                    social: [socialAuthData],
                });
                // save the user
                newUser.save(err => {
                    if (err) {
                        return done(null, false, { message: err });
                    }

                    return done(null, newUser);
                });
            });
    });
});

googleStrategy.userProfile = (accessToken, done) => {
    axios
        .get(config.get('google.profileUrl'), {
            params: {
                access_token: accessToken,
            },
        })
        .then(response => {
            return done(null, response.data);
        });
};

passport.use('google', googleStrategy);

module.exports = passport;
