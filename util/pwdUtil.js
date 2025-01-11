const bcrypt = require('bcrypt');

const { hash, compare, genSalt } = bcrypt;

const generatePasswordHash = async (password) => {
    const saltRounds = 10;
    const salt = await genSalt(saltRounds);
    //console.log(salt);
    const hashedPwd = await hash(password, salt);
    //console.log(hashedPwd);
    return hashedPwd;
}

const verifyPassword = async (password, pwdHash) => {
    const data = await compare(password, pwdHash);
    //console.log(data);
    return data;
}

module.exports = { generatePasswordHash, verifyPassword };