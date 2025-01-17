const User = require('../models/user');
const Chat = require('../models/chat');
const { generateAccessToken } = require('../util/jwtUtil');
const sequelize = require('../util/database');
const UserServices = require('../services/userServices');

exports.postChat = async (req, res, next) => {
    const chatMsg = req.body.chatMsg;

    try {
        const userMsg = {
            chatMsg: chatMsg,
        };

        const chatData = await UserServices.createData(req.user, userMsg, "createChat");
        //console.log(chatData);

        if(chatData) {
            res.status(201).json({
                message: 'Chat Message Added',
                newChatMsg: chatData,
                success: true
            });
        }
    }
    catch(err) {
        //console.log(err);
        if(err.name === 'SequelizeValidationError' || 'SequelizeUniqueConstraintError') {
            err.statusCode = 400;
        }
        next(err);
    }
}