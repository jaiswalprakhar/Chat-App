const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ArchivedChat = sequelize.define('archivedChat', {
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
    },
    userId: {
      type: Sequelize.INTEGER
    },
    groupId: {
      type: Sequelize.INTEGER
    },
});

module.exports = ArchivedChat;