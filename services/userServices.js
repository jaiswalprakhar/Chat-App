const sequelize = require('../util/database');

// Find OR GET Network Calls-
const findData = (tableName, howMany, where) => {
    if (howMany === 'One') {
        return tableName.findOne(where);  // Find one record
      } else if (howMany === 'All') {
        return tableName.findAll(where);  // Find all records
      } else {
        throw new Error('Invalid value for howMany');
      }
}

const getExpensesData = (user, where) => {
    return user.getExpenses(where);
}

const getExpenseFilesData = (user) => {
    return user.getExpenseFiles();
}

//Save Network Calls-
const saveData = (user, transaction) => {
    if(!transaction) {
        //console.log("Executed without transaction");
        return user.save();
    }
    //console.log("Executed with transaction");
    return user.save(transaction);
}

//CREATE Network Calls-
const createData = (tableName, userData, createTableName, transaction) => {
    if(!transaction) {
        //console.log("Executed without transaction");
        if(createTableName) {
            //console.log("Executed with createTableName");
            return tableName[createTableName](userData);
        }
        else {
            //console.log("Executed with create");
            return tableName.create(userData);
        }
    }
    else {
        //console.log("Executed with transaction");
        if(createTableName) {
            //console.log("Executed with createTableName");
            return tableName[createTableName](userData, transaction);
        }
        else {
            //console.log("Executed with create");
            return tableName.create(userData, transaction);
        }
    }
}

//Delete Network Calls-
const deleteData = (userData, transaction) => {
    if(!transaction) {
        //console.log("Executed without transaction");
        return userData.destroy();
    }
    //console.log("Executed with transaction");
    return userData.destroy(transaction);
}

//Sequelize Methods -
const countExpensesData = (user) => {
    return user.countExpenses();
}

module.exports = {
    findData,
    getExpensesData,
    getExpenseFilesData,
    saveData,
    createData,
    deleteData,
    countExpensesData
}