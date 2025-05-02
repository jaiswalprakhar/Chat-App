const User = require('../models/user');
const Chat = require('../models/chat');
const Group = require('../models/group');
const sequelize = require('../util/database');
const UserServices = require('../services/userServices');
const S3Services = require('../services/s3Services');
const socketController = require('../controllers/socket');

module.exports = (io, user, socket) => {
    console.log('Chat socket connected:', socket.id);

    socket.on('send-message', async (data, callback) => {
        const t = await sequelize.transaction();

        try {
            //console.log("Socket is in rooms:", Array.from(socket.rooms));
            const { chatMsg, receiverId, groupId, fileName, mimeType, file } = data;
            //console.log(file);
            let fileURL = null, s3fileName;
            if(file) {
                const base64Data = file?.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                const maxSize = 1 * 1024 * 1024; // 1MB
                //console.log(buffer);
                if(buffer.length > maxSize) {   //Here buffer.length is size of file
                    await t.rollback();
                    return callback({ 
                        success: false, 
                        message: `File size should not be greater than 1MB`,
                    });
                }

                // Upload PDF to S3
                s3fileName = `Chat/${fileName}/${new Date()}.pdf`;
                fileURL = await S3Services.uploadToS3(buffer, s3fileName, mimeType);
                //console.log(s3fileName, fileURL)
            }

            let room;
            if(groupId) {
                const group = await user.getGroups({ where: { id: groupId } });
                if(!group[0])  {
                    return callback({ 
                        success: false, 
                        message: 'User not Group Member' 
                    });
                }
                room = `group-${group[0].id}`;
                //console.log(room);
            }
            else {
                room = user.id >= receiverId ? `personal-chat-${receiverId}${user.id}` : 
                `personal-chat-${user.id}${receiverId}`;
                //console.log(room);
            }

            const userMsg = {
                        chatMsg: chatMsg,
                        receiverId: receiverId,
                        groupId: groupId,
                        fileName: fileName,
                        mimeType: mimeType,
                        fileUrl: fileURL,
                    };
            
            const chatData = await UserServices.createData(socket.user, userMsg, "createChat", { transaction: t });
            //console.log(chatData);

            if(chatData) {
                if (socket.rooms.has(room)) {
                    console.log(`Socket ${user.id} is in room-name`);
                    socket.to(room).emit("receive-message", user.fullName, chatData);
                  }
                await t.commit();
                callback({
                    success: true,
                    message: `Chat Message Added`,
                    newChatMsg: chatData
                });
            }
        }
        catch (err) {
            //console.log(err);
            await t.rollback();
            console.log(err.message);
            callback({ 
                success: false,
                message: err.message
            });
        }
    });
};