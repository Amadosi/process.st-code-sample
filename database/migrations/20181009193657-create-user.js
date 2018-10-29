'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            reference: {
                type: Sequelize.STRING,
                unique: true,
                allowNull:false
            },
            fullName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            password: {
                type: Sequelize.STRING,
                allowNull:false
            },
            phoneNumber: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            gender: {
                type: Sequelize.STRING,
                allowNull: false
            },
            preferences: {
                type: Sequelize.JSON,
                allowNull: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('users');
    }
};