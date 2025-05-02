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
    },
    fileName: {
      type: Sequelize.STRING      
    },
    mimeType: {
      type: Sequelize.STRING      
    },
    fileUrl: {
      type: Sequelize.STRING   
    }
});

module.exports = Chat;