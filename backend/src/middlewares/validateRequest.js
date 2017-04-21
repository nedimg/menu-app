const jwt = require('jsonwebtoken');
const config = require('config');


const User = require('../models/user');

module.exports = (req, res, next) => {
    // check header or url parameters or post parameters for token
    const token = req.body.token || req.query.token || req.headers['x-access-token'] || (req.headers.authorization && (req.headers.authorization.split(' ')[1]));

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.get('jwtSecret'), (err, decoded) => {
            if (err) {
                return res.status(403).send({ success: false, message: 'Failed to authenticate token.' });
            }
            // if everything is good, save to request for use in other routes
            User
                .findOne({ email: decoded.email })
                .then(user => {
                    req.user = user;
                    next();
                });
        });
    } else {
        // if there is no token
        // return an error
        res.status(403).send({ success: false, message: 'No token provided.' });
    }
};
