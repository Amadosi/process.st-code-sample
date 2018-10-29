const express 			= require('express');
const router 			= express.Router();

const {UserController} = require('../http/controllers');

// for creating user
router.post('/register', UserController.create);
//to login a user
router.post('/login', UserController.login);
//user account verification
router.post('/verify', UserController.verify);

//export the router
module.exports = router;