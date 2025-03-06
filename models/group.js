const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Group = sequelize.define('group', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    groupName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          customValidator(value) {
            if (value === "") {
              throw new Error("Group Name cannot be empty");
            }
            else if (value.length > 30) {
                throw new Error("Group Name should not be more than 30 albhabets");
            }
          }
        }
    },
    createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    groupInvite: {
      type: Sequelize.UUID,
      allowNull: false
    }
});

module.exports = Group;