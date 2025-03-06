const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('user', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    fullName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            noNumbers(value) {
                if (/\d/.test(value)) {
                    throw new Error('Name should not contain numbers');
                }
                else if(value === "") {
                  throw new Error('Name cannot be empty');
                }
            }
        }
    },
    emailId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: {
            args: true,
            msg: 'Email ID already exists'
        },
        validate: {
            isEmail: {
                args: true,
                msg: 'Enter a valid Email Address'
            }
        }
    },
    phoneNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: {
            args: true,
            msg: 'Phone Number already exists'
        },
        validate: {
            customValidator(value) {
              if (value.length !== 10) {
                throw new Error("Phone Number should be 10 digits long");
              }
            }
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = User;