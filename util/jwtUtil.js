const { sign, verify } = require('jsonwebtoken');

const generateAccessToken = (id, name) => {
    const token = sign({ userId: id, name: name }, process.env.SECRET_KEY);
    return token;
}

const verifyAccessToken = (token) => {
    return verify(token, process.env.SECRET_KEY);
}

module.exports = { generateAccessToken, verifyAccessToken };