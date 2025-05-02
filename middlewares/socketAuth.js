const { verifyAccessToken } = require('../util/jwtUtil');
const User = require('../models/user');

const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        const decodedUser = verifyAccessToken(token);
        const user = await User.findByPk(decodedUser.userId);
        if(!user) {
            next(new Error('You are an Invalid User'));
        }
        else {
            socket.user = user;
            console.log(`Socket ${socket.id} is Authenticated`);
            next();
        }
    }
    catch(err) {
        //console.log(err);
        if(err.message === "jwt must be provided")
        {
            err.message = "User Not Authorised, Login Again";
        }
        next(new Error(err.message || 'Authentication failed'));
    }
}

module.exports = { authenticateSocket };