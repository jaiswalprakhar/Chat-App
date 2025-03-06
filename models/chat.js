const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Chat = sequelize.define('chat', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    chatMsg: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          customValidator(value) {
            if (value === "") {
              throw new Error("Message cannot be empty");
            }
          }
        }
    },
    receiverId: {
      type: Sequelize.INTEGER
    }
});

module.exports = Chat;