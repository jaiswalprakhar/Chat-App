const User = require('../models/user');
const Group = require('../models/group');
const uuid = require('uuid');
const sequelize = require('../util/database');
const UserServices = require('../services/userServices');
const socketController = require('../controllers/socket');

module.exports = (io, user, socket) => {
    console.log('Group socket connected:', socket.id);
    
    socket.on('create-group', async (data, callback) => {
      const t = await sequelize.transaction();
      
      try { 
        const { groupName, usersList } = data;
        
          if(usersList.length <= 0) {
            return callback({ 
              success: false, 
              message: 'Add Participants in the group' 
            });
          } 
          const usersData = [];
          for(let val of usersList){
              if(Number(val) !== user.phoneNumber) {
                  const howMany = 'One';
                  const where = {
                    where: { phoneNumber: val }
                  };
                  const user = await UserServices.findData(User, howMany, where);

                  if(!user)   {
                    return callback({ 
                      success: false, 
                      message: 'User does not exist' 
                    });
                  }
                  usersData.push(user);
              }
              else {
                return callback({ 
                  success: false, 
                  message: 'Do not add your own PhoneNumber' 
                });
              }
          }
          
          const groupData = {
              groupName : groupName,
              createdBy: user.id,
              groupInvite: uuid.v4()
          }

          const createGroupData = await UserServices.createData(Group, groupData, "", { transaction: t });
          const addAdminData = await user.addGroup(createGroupData, { through: { admin: true }, transaction: t });
          const addMembersData = await createGroupData.addUsers(usersData, { through: { admin: false }, transaction: t });
         
          const room = `group-${createGroupData.id}`;
          //console.log(socket.id);
          //console.log(`room = ${room}`);
          socket.join(room);
          
          if(addAdminData && addMembersData) {
              const message = `${user.fullName} Added you in ${groupName} group`;
              //console.log(message);
              usersData.forEach(user => {
                const addedUserSocket = socketController.getUserSocket(user.id);
                if(addedUserSocket) {
                    //console.log(user.id, addedUserSocket.id);
                    addedUserSocket.join(room);
                    addedUserSocket.emit('new-group-added-user', message, createGroupData);
                }
              })
              await t.commit();
              callback({
                success: true,
                message: `${groupName} group created successfully`,
                createdGroupData: createGroupData
              });
          }
      }
      catch (err) {
        //console.log(err);
          await t.rollback();
          callback({ 
            success: false, 
            message: err.message 
          });
      }
    });

    socket.on('join-group', (groupId, message) => {
        const room = `group-${groupId}`;
        socket.join(room);
        message(`Joined ${room}`);
    });

    socket.on('join-personal-chat', (userId, message) => {
        const room = user.id >= userId ? 
        `personal-chat-${userId}${user.id}` : `personal-chat-${user.id}${userId}`;
        socket.join(room);
        message(`Joined ${room}`);
    });

    socket.on('leave-group', (data, message) => {
      const { userId, groupId, groupName } = data;
      const room = `group-${groupId}`;
      //console.log("Socket is in rooms:", socket.rooms);

      if(user.id === userId)  {
        socket.leave(room);
        console.log("Socket is in rooms(Admin):", socket.rooms);
        message(`You left socket room ${room}`);
      }
      else {
        const userSocket = socketController.getUserSocket(userId);
        if(userSocket)  {
          //console.log("Socket is in rooms(User):", socket.rooms);
          const msg = `${user.fullName}(Admin) removed you from group ${groupName}`;
          userSocket.emit('admin-removed-group-user', msg);
        }
        else  {
          message(`User already removed from socket room ${room}`);
        }
      }
    });
};