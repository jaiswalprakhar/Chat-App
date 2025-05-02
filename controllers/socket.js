const User = require('../models/user');

const userSockets = new Map();

const socketController = {
    // Add user's socket to tracking
    addUserSocket: (user, socket) => {
        userSockets.set(user.id, socket);
    },

    // Remove user's socket from tracking
    removeUserSocket: (userId) => {
        userSockets.delete(userId);
    },

    // Get socket for a specific user
    getUserSocket: (userId) => {
        return userSockets.get(userId);
    },

    // Get user details from socket
    getUserDetails: (socket) => {
        return socket.user;
    },

    // Fetch all sockets-
    showAllSockets: () => {
        console.log(userSockets.keys());
    }
};

module.exports = socketController;