'use strict';
module.exports = (sequelize, DataTypes) => {
    const Business = sequelize.define('Business', {
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
    return Business;
};