const express = require('express');
const router = new express.Router();

const auth = require('./auth.js');
const users = require('./users.js');
const passport = require('./middlewares/passport');

/*
 * Routes that can be accessed by any one
 */
router.post('/api/auth/login', auth.login);
router.post('/api/auth/signup', auth.signup);
router.get('/api/auth/facebook', passport.authenticate('facebook'));
router.get('/api/auth/facebook/callback', passport.authenticate('facebook', { session: false }), auth.facebookCallback);
router.get('/api/auth/google', passport.authenticate('google'));
router.get('/api/auth/google/callback', passport.authenticate('google', { session: false }), auth.googleCallback);

/*
 * Routes that can be accessed only by autheticated users
 */
router.get('/api/v1/users', users.getAll);
router.post('/api/v1/users/setPassword', users.setPassword);

router.get('/api/v1/users/:id', users.getOne);
router.get('/api/v1/users/:id', users.getOne);
// router.post('/api/v1/product/', products.create);
// router.put('/api/v1/product/:id', products.update);
// router.delete('/api/v1/product/:id', products.delete);

/*
 * Routes that can be accessed only by authenticated & authorized users
 */

// router.get('/api/v1/admin/users', user.getAll);
// router.get('/api/v1/admin/user/:id', user.getOne);
// router.post('/api/v1/admin/user/', user.create);
// router.put('/api/v1/admin/user/:id', user.update);
// router.delete('/api/v1/admin/user/:id', user.delete);

module.exports = router;
