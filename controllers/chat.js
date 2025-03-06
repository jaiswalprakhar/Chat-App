const User = require('../models/user');
const Chat = require('../models/chat');
const Group = require('../models/group');
const { generateAccessToken } = require('../util/jwtUtil');
const sequelize = require('../util/database');
const UserServices = require('../services/userServices');
const { Op } = require('sequelize');

exports.countChats = async (req, res, next) => {
    try {
        const totalChats = await Chat.count();
    
        return totalChats > 0 ? res.status(200).json({
            totalChats: totalChats,
            success: true
        }) : res.status(200).json({
            totalChats: totalChats,
            message: "Not Chatted",
            success: true
        });
        
        /*if(totalChats)  {
            return res.status(200).json({
                totalChats: totalChats,
                success: true
            });
        }
        else {
            return res.status(204).json({
                message: "Not Chatted",
                success: true
            });
        }*/
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
    const t = await sequelize.transaction();
    const chatMsg = req.body.chatMsg;
    const receiverId = req.body.receiverId;
    const groupId = req.body.groupId;

    try {
        if(groupId) {
            const group = await req.user.getGroups({ where: { id: groupId } });
            if(!group[0])  {
                const error = new Error('User not Group Member');
                error.statusCode = 404;
                throw error;
            }
            //await group[0].addChat(chatData, { transaction: t });
        }
        const userMsg = {
            chatMsg: chatMsg,
            receiverId: receiverId,
            groupId: groupId
        };

        const chatData = await UserServices.createData(req.user, userMsg, "createChat", { transaction: t });
        //console.log(chatData);

        if(chatData) {
            await t.commit();
            res.status(201).json({
                message: 'Chat Message Added',
                newChatMsg: chatData,
                success: true
            });
        }
    }
    catch(err) {
        //console.log(err);
        await t.rollback();
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
            let groupId = req.query.groupId;
            let receiverId = req.query.receiverId;
            
            if(lastMsgId === 0)  {
                lastMsgId = 0;
            }
            lastMsgId = Number(lastMsgId);
            console.log("lastMsgId=", lastMsgId);
            
            let usersChatData;
            
            if(receiverId == "null") {
                usersChatData = await Chat.findAll({
                    where: { groupId: groupId },
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
            }
            else {
                usersChatData = await Chat.findAll({
                    where: {
                        [Op.or]: [
                            { userId: req.user.id, receiverId: receiverId },
                            { userId: receiverId, receiverId: req.user.id }
                        ]
                    },
                    include: [
                        {
                            model: User, // Include the associated model
                            attributes: ['id', 'fullName'], // Select specific fields (optional)
                        },
                    ],
                    attributes: ['id', 'chatMsg', 'userId', 'receiverId'], // Select fields from User model (optional)
                    order: [
                        ['id', 'ASC'], // Order Users by name (ascending)
                        ],
                        offset: lastMsgId,
                        limit: 10
                });
            }

            //console.log(usersChatData);

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