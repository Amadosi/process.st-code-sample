'use strict';
const {users} = require('../../models');
const jwt = require('jsonwebtoken');
const cloudinary = require('../../services/Cloudinary');
const nexmo = require('../../services/Nexmo');
const multer = require('multer');
const cmd = require("node-cmd");

const VerifyNotification = require("../../notifications/AccountVerificationNotifications");

/**
 * Create user
 * function
 * */
const create = async (req, res) => {
    const body = req.body;

    const [err, user] = await To(users.create(body));

    if (err) return ErrorResponse(res, err, 400);

    //send verification email
    user.notify(VerifyNotification);

    return SuccessResponse(res, 'verification email has been sent');

};

/**
 * Function for logging in a
 * user
 * */
const login = async (req, res) => {

    console.log(req.body);

    const body = req.body;

    if (!body.email || !body.password)
        return ErrorResponse(res, {message: 'email and password required'}, 400);

    let err, user, pass;

    [err, user] = await To(users.findOne({where: {email: body.email}}));

    if (err) ThrowError(err.message);

    if (!user)
        return ErrorResponse(res, {message: 'unauthorised'}, 401);

    [err, pass] = await To(user.comparePassword(body.password));

    if (!pass)
        return ErrorResponse(res, {message: 'unauthorised'}, 401);

    //if the user is not authorised return a 403
    if (!user.preferences.confirmed)
        return ErrorResponse(res, {message: 'account not verified'}, 403);

    const data = user.toJSON();
    //delete the password from the data
    delete data.password;

    return SuccessResponse(res, "login successful", {token: user.getJWT(), user: data});
};

/**
 * Function for getting
 * user
 * */
const get = async (req, res) => {
    let user = req.user;

    const data = user.toJSON();
    //delete the password from the data
    delete data.password;

    return SuccessResponse(res, "user retrieved", data);
};

/**
 * Function for updating the
 * user
 * */
const update = async (req, res) => {
    let err, user, data;

    user = req.user;
    data = req.body;

    [err, user] = await To(user.update(data));

    if (err) {
        return ErrorResponse(res, {message: err}, 400);
    }

    const user_data = user.toJSON();
    //delete the password from the data
    delete user_data.password;

    return SuccessResponse(res, 'User Updated', user_data);
};

/**
 * Function to update a users password
 * */
const updatePassword = async (req, res) => {
    let err, user, data, pass;

    user = req.user;
    data = req.body;

    //ensure all fields are present
    if (!data.current_password || !data.password || !data.password_confirm) {
        return ErrorResponse(res, {message: "current password, new pasword, and password confirm are all required"}, 400);
    }
    console.log(data);

    //check if the new password and confirm password match
    if (data.password !== data.password_confirm)
        return ErrorResponse(res, {message: "New password must match the confirm password"}, 400);

    //check if the current password matches
    [err, pass] = await To(user.comparePassword(data.current_password));

    if (!pass)
        return ErrorResponse(res, {message: "Your password is not correct"}, 400);

    //update the password
    user.update({
        password: data.password
    });

    return SuccessResponse(res, "Password Updated", null, 200);
};

/**
 * Function to upload a users profile image
 * */
const uploadProfilePhoto = async (req, res) => {
    let _err;

    let user = req.user;

    const multerUpload = multer({dest: 'temp_upload'}).single('photo');

    multerUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return ErrorResponse(res, {message: err}, 400);
        } else if (err) {
            // An unknown error occurred when uploading.
            return ErrorResponse(res, {message: err}, 400);
        }

        //handle the file upload
        cloudinary.v2.uploader.upload(
            req.file.path,
            {
                public_id: `${user.id}`,
                crop: 'limit',
                width: 2000,
                height: 2000,
                tags: ['profile_photo']
            },
            async (error, result) => {
                if (error)
                    return ErrorResponse(res, "error updating profile image. try again", 500);
                //remove the file from server
                //cmd.run(`rm -rf ${req.file.path}`); //activate for linux
                cmd.run(`del ${req.file.path}`); //activate for windows

                //save the photo url to db
                [_err, user] = await To(user.update({
                    profile_photo: result.secure_url
                }));

                if (_err)
                    return ErrorResponse(res, "error updating profile image. try again", 500);


                return SuccessResponse(res, 'Profile photo updated', {profile_photo: user.profile_photo});
            });
    });

    //upload image to cloudinary with user id

};

/**
 * Function to verify a users account
 * */
const verify = async (req, res) => {
    //get the token
    const token = req.body.token;
    // invalid token - synchronous
    try {
        const decoded = jwt.verify(token, CONFIG.jwt_encryption);

        let err, user;
        [err, user] = await To(users.findById(decoded.user_id));

        if (!user)
            return ErrorResponse(res, {message: 'user not found'}, 404);

        //check if the user has already been confirmed
        if (user.preferences.confirmed)
            return ErrorResponse(res, {message: 'this link is no longer valid'}, 403);

        //set update the users confirmed status
        [err, user] = await To(user.update({preferences: {...user.preferences, confirmed: true}}));
        //if no error
        if (err)
            return ErrorResponse(res, {message: err.message}, 400);

        return SuccessResponse(res, "Account successfully verified");

    } catch (err) {
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            return ErrorResponse(res, {message: 'this link is not valid'}, 401);
        }
    }
};

/**
 * function to verify a user phone numbers
 * */
const verifyPhoneNumber = async (req, res) => {

    let err;
    //get the user from request
    let user = req.user;
    const action = req.body.action;

    //check if the user has not been verified
    if (user.preferences.phone_verified)
        return ErrorResponse(res, {message: 'Number already verified'}, 403);

    if (action === 'send') {
        //send a verification message
        nexmo.verify.request({
            number: "234" + user.phoneNumber,
            brand: process.env.APP_NAME
        }, function (error, response) {

            if (!response)
                return ErrorResponse(res, {message: 'error while processing request'}, 500);

            if (response.hasOwnProperty('status') && response.status === '0') {
                return SuccessResponse(res, "OTP sent", response);
            } else {
                return ErrorResponse(res, {message: response.error_text}, 400);
            }
        });
    } else if (action === 'verify') {
        const {requestId, code} = req.body;

        if (!requestId || !code)
            return ErrorResponse(res, {message: 'verify request_id and code required'}, 400);

        nexmo.verify.check({request_id: requestId, code: code}, async function (error, response) {

            if (!response)
                return ErrorResponse(res, {message: 'error while processing request'}, 500);

            if (response.hasOwnProperty('status') && response.status === '0') {
                //update the users phone verified
                const preferences = {
                    ...user.preferences,
                    phone_verified: true
                };

                [err, user] = await To(user.update({preferences}));

                if (err)
                    return ErrorResponse(res, err, 400);

                return SuccessResponse(res, "number verified", response);
            } else {
                return ErrorResponse(res, {message: response.error_text}, 400);
            }
        });
    } else if (action === 'cancel') {
        //get the request id
        const {requestId} = req.body;

        if (!requestId)
            return ErrorResponse(res, {message: 'request_id required'}, 400);

        nexmo.verify.control({request_id: requestId, cmd: 'cancel'}, async function (error, response) {

            if (!response)
                return ErrorResponse(res, {message: 'error while processing request'}, 500);

            if (response.hasOwnProperty('status') && response.status === '0') {

                return SuccessResponse(res, "verification request cancelled", response);
            } else {
                return ErrorResponse(res, {message: response.error_text}, 400);
            }
        });
    } else if (action === 'resend') {
        //first cancel the initial request
        //get the request id
        const {requestId} = req.body;

        if (!requestId)
            return ErrorResponse(res, {message: 'request_id required'}, 400);

        nexmo.verify.control({request_id: requestId, cmd: 'cancel'}, async function (error, response) {

            if (!response)
                return ErrorResponse(res, {message: 'error while processing request'}, 500);

            if (response.hasOwnProperty('status') && response.status === '0') {
                //issue a new one
                nexmo.verify.request({
                    number: "234" + user.phoneNumber,
                    brand: process.env.APP_NAME
                }, function (error, response) {

                    if (!response)
                        return ErrorResponse(res, {message: 'error while processing request'}, 500);

                    if (response.hasOwnProperty('status') && response.status === '0') {
                        return SuccessResponse(res, "OTP sent", response);
                    } else {
                        return ErrorResponse(res, {message: response.error_text}, 400);
                    }
                });

            } else {
                return ErrorResponse(res, {message: response.error_text}, 400);
            }
        });
    } else {
        return ErrorResponse(res, {message: 'action field not specified'}, 400);
    }

};

/**
 * function to verify a users email
 * */
const verifyEmail = async (req, res) => {
    //get the email
    const email = req.body.email;

    if (!email)
        return ErrorResponse(res, 'Email field if required', 400);

    //get the user with that email
    const [err, user] = await To(users.findOne({where: {email}}));

    if (err)
        return ErrorResponse(res, err, 400);

    if (!user)
        return ErrorResponse(res, "user not found", 404);

    if (user.preferences.confirmed)
        return ErrorResponse(res, "account already verified", 403);

    //send verification email
    user.notify(VerifyNotification);

    return SuccessResponse(res, 'verification email has been sent');
};

module.exports = {
    create,
    get,
    login,
    update,
    verify,
    uploadProfilePhoto,
    verifyPhoneNumber,
    verifyEmail,
    updatePassword
};