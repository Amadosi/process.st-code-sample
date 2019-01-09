'use strict';

const shortid = require("shortid");

require('../global/functions');

const bcrypt = require('bcrypt');
const bcrypt_promise = require('bcrypt-promise');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define('users', {
        reference: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                isEmail: true
            }
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        phoneNumber: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        profile_photo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        preferences: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {});

    User.associate = models => {
        // associations can be defined here
    };

    /** Auto generate a user reference
     * before creation*/
    User.beforeCreate(async (user, option) => {
        //generate a shortid reference
        user.reference = shortid.generate();
        //set the preferences
        user.preferences = {confirmed: false};
    });

    /** encrypt the password before save*/
    User.beforeSave(async (user, options) => {
        let err;
        if (user.changed('password')) {
            let salt, hash;
            [err, salt] = await To(bcrypt.genSalt(10));
            if (err) ThrowError(err.message, true);

            [err, hash] = await To(bcrypt.hash(user.password, salt));
            if (err) ThrowError(err.message, true);

            user.password = hash;
        }

        //capitalise the full name
        if (user.changed('fullName')) {
            user.fullName = user.fullName.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
    });

    /**
     * a prototype function to match the users
     * password with a provided password
     * */
    User.prototype.comparePassword = async function (pw) {
        let err, pass;

        if (!this.password)
            return false;

        [err, pass] = await To(bcrypt_promise.compare(pw, this.password));

        if (err)
            ThrowError(err);

        return pass;

    };

    /**
     * a prototype function to generate a
     * jwt for a user
     * */
    User.prototype.getJWT = function () {
        let expiration_time = parseInt(CONFIG.jwt_expiration);
        return jwt.sign({user_id: this.id}, CONFIG.jwt_encryption, {expiresIn: expiration_time});
    };

    /**
     * a prototype for sending user notifications
     * */
    User.prototype.notify = function (Notification,data=null){
        new Notification(this, data).notify();
    };


    User.prototype.toJson = () => this.toJson();
    return User;
}
;