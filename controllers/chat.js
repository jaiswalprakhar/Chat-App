const User = require('../models/user');
const Chat = require('../models/chat');
const { generateAccessToken } = require('../util/jwtUtil');
const sequelize = require('../util/database');
const UserServices = require('../services/userServices');

exports.countChats = async (req, res, next) => {
    try {
        const totalChats = await Chat.count();

        if(totalChats)  {
            return res.status(200).json({
                totalChats: totalChats,
                success: true
            });
        }
    }
    catch {
        //console.log(err);
        if(err.name === 'SequelizeValidationError' || 'SequelizeUniqueConstraintError') {
            err.statusCode = 400;
        }
        next(err);
    }
}

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

exports.getChats = async (req, res, next) => {
    try {
            /*const howMany = 'All';
            const where = {
                order: [['createdAt', 'ASC']]
            };
            const usersChatData = await UserServices.findData(Chat, howMany, where);*/
            let lastMsgId = req.query.lastMsgId;
            if(lastMsgId === 0)  {
                lastMsgId = 0;
            }
            lastMsgId = Number(lastMsgId);
            console.log("lastMsgId=", lastMsgId);

            const usersChatData = await Chat.findAll({
                include: [
                    {
                    model: User, // Include the associated model
                    attributes: ['id', 'fullName'], // Select specific fields (optional)
                    },
                ],
                attributes: ['id', 'chatMsg', 'userId'], // Select fields from User model (optional)
                order: [
                    ['id', 'ASC'], // Order Users by name (ascending)
                    ],
                    offset: lastMsgId,
                    limit: 10
            });

            //console.log(usersChatData.length);
         
            /*const usersChatData = await Chat.findAll({
                include: [
                  {
                    model: User, // Include the associated model
                    attributes: ['id', 'fullName'], // Select specific fields (optional)
                  },
                ],
                attributes: ['id', 'chatMsg', 'createdAt', 'userId'], // Select fields from User model (optional)
                order: [
                    ['id', 'ASC'], // Order Users by name (ascending)
                  ],                
              });
            
            console.log(usersChatData);*/

            if(!usersChatData) {
                throw new Error('Unable to fetch Chats');
            }

            const message = 'All Chats Fetched';

            return res.status(200).json({
                message: message,
                usersChat: usersChatData,
                lastMsgId: lastMsgId + usersChatData.length,
                success: true
            });
    }
    catch(err) {
        //console.log(err);
        next(err);
    }
}