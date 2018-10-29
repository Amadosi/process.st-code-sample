'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

      return queryInterface.addColumn('users', 'profile_photo', {
          type: Sequelize.STRING,
          allowNull: true,
          unique: false
      });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.removeColumn('users', 'profile_photo');
  }
};
