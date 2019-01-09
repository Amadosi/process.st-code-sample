'use strict';
const shortid = require("shortid");

module.exports = (sequelize, DataTypes) => {
    const Business = sequelize.define('Business', {
        reference: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        }
    }, {});

    Business.associate = function (models) {
        // associations can be defined here
        Business.belongsTo(models.users, {
            foreignKey: 'user_id',
            as: "user"
        });
    };

    /** Auto generate a user reference
     * before creation*/
    Business.beforeCreate(async (business, option) => {
        //generate a shortid reference
        business.reference = shortid.generate();
    });

    return Business;
};