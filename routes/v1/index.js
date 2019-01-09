const express = require('express');
const router = express.Router();

const {UserController, BusinessController} = require('../../http/controllers');

const passport = require('passport');


/**
 * middleware for using passport to protect routes
 * and parse the user making request into the request
 * object
 * */
require('./../../http/middleware/passport')(passport);

router.post('/users/verify-email', UserController.verifyEmail);
router.get('/users', passport.authenticate('jwt', {session: false}), UserController.get);
router.put('/users', passport.authenticate('jwt', {session: false}), UserController.update);
router.post('/users/profile-photo', passport.authenticate('jwt', {session: false}), UserController.uploadProfilePhoto);
router.post('/users/verify-phone', passport.authenticate('jwt', {session: false}), UserController.verifyPhoneNumber);

router.post('/businesses', passport.authenticate('jwt', {session: false}), BusinessController.create);
router.get('/businesses',passport.authenticate('jwt', {session: false}), BusinessController.get);
router.get('/businesses/:id');

module.exports = router;