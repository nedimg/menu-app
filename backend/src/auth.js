const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('config');

const User = require('./models/user');

// private method
function genToken(user) {
    return new Promise((resolve, reject) => {
        jwt.sign({ email: user.email }, config.get('jwtSecret'), { expiresIn: 60 * 60 * 5 }, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
}

const signup = (req, res) => {
    User
        .findOne({ email: req.body.email.toLowerCase() })
        .then(existingUser => {
            if (existingUser) {
                if (!existingUser.password && existingUser.social && existingUser.social.length) {
                    res.status(400).send({
                        success: false,
                        message: 'email associated with other authentication providers',
                        providers: existingUser.social.map(s => { return { provider: s.provider, name: s.name }; }),
                    });
                } else {
                    res.status(400).send({
                        success: false,
                        message: 'email is in use',
                    });
                }
            } else {
                // create a new user
                const newUser = new User({
                    email: req.body.email,
                    password: req.body.password,
                });

                // save the user
                newUser
                    .save(err => {
                        if (err) {
                            res.status(400).send({
                                success: false,
                                message: err.message,
                            });
                        } else {
                            genToken(newUser).then(token => res.json(token));
                        }
                    });
            }
        });
};

const login = (req, res) => {
    User
        .findOne({ email: req.body.email.toLowerCase() })
        .then(user => {
            if (!user) {
                res.status(401).send({
                    success: false,
                    message: 'email is in not use',
                });
            } else {
                if (user.password) {
                    bcrypt
                        .compare(req.body.password, user.password)
                        .then(result => {
                            if (!result) {
                                res.status(401).send({
                                    success: false,
                                    message: 'password is not valid',
                                });
                            } else {
                                genToken(user)
                                    .then(token => res.json(token));
                            }
                        });
                } else {
                    const providers = user.social.map(s => s.provider);
                    res.status(401).send({
                        providers,
                        success: false,
                        message: 'email associated with other account(s)',
                    });
                }
            }
        });
};

const facebookCallback = (req, res) => {
    genToken(req.user)
        .then(token => {
            const responseHtml = `<html><head></head><body><script type="text/javascript">window.opener.postMessage("${ token }","http://localhost:3000")</script></body></html>`;
            res.send(responseHtml);
        });
};

const googleCallback = (req, res) => {
    genToken(req.user)
        .then(token => {
            const responseHtml = `<html><head></head><body><script type="text/javascript">window.opener.postMessage("${ token }","http://localhost:3000")</script></body></html>`;
            res.send(responseHtml);
        });
};

module.exports = {
    login,
    signup,
    facebookCallback,
    googleCallback,
};
