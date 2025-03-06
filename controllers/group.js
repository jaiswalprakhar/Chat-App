const User = require('../models/user');
const Chat = require('../models/chat');
const Group = require('../models/group');
const uuid = require('uuid');
const sequelize = require('../util/database');
const UserServices = require('../services/userServices');

exports.createGroup = async (req, res, next) => {
    const t = await sequelize.transaction();
    const groupName = req.body.groupName;
    const usersList = req.body.userIdList;

    try {
        if(usersList.length <= 0) {
            const error = new Error('Add Participants in the group');
            error.statusCode = 403;
            throw error;
        } 
        const usersData = [];
        for(let val of usersList){
            if(Number(val) !== req.user.phoneNumber) {
                const howMany = 'One';
                const where = {
                where: { phoneNumber: val }
                };
                const user = await UserServices.findData(User, howMany, where);
                if(!user)   {
                    const error = new Error('User does not exist');
                    error.statusCode = 404;
                    throw error;
                }
                usersData.push(user);
            }
            else {
                const error = new Error('Do not add your own PhoneNumber');
                error.statusCode = 403;
                throw error;
            }
        }
        
        const groupData = {
            groupName : groupName,
            createdBy: req.user.id,
            groupInvite: uuid.v4()
        }

        const createGroupData = await UserServices.createData(Group, groupData, "", { transaction: t });
        const addAdminData = await req.user.addGroup(createGroupData, { through: { admin: true }, transaction: t });
        const addMembersData = await createGroupData.addUsers(usersData, { through: { admin: false }, transaction: t });
        
        if(addAdminData && addMembersData) {
            await t.commit();
            res.status(201).json({
                message: `${groupName} group created successfully`,
                createdGroupData: createGroupData,
                success: true
            });
        }
    }
    catch (err) {
        //console.log(err);
        await t.rollback();
        if(err.name === 'SequelizeValidationError' || 'SequelizeUniqueConstraintError') {
            err.statusCode = 400;
        }
        next(err);
    }
}

exports.getGroupOrPersonList = async (req, res, next) => {
    try {
        const howMany = 'All';
        const where = {
            attributes: ['id', 'fullName', 'phoneNumber']
        };
        const usersListPromise = UserServices.findData(User, howMany, where);
        const groupsListPromise = req.user.getGroups();

        const [usersList, groupsList] = await Promise.all([usersListPromise, groupsListPromise]);
        //console.log(groupsList);

        if(usersList || groupsList) {
           return res.status(200).json({
                message: `Users Fetched`,
                groupsListData: groupsList,
                usersListData: usersList,
                success: true
            });
        }
    } 
    catch (err) {
        //console.log(err);
        next(err);
    }
}

exports.getGroupData = async (req, res, next) => {
    const groupId = req.params.id;

    try {
        const group = await Group.findByPk(groupId);
        const IsMemberPromise = group.hasUser(req.user);
        const userPromise = req.user.getGroups({ where: { id: groupId } });

        const [IsMember, user] = await Promise.all([IsMemberPromise, userPromise]);

        if(IsMember) {
            const groupData = await Group.findOne({
                where: { id: groupId },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'fullName', 'emailId', 'phoneNumber'],
                        through: { attributes: ['id', 'admin', 'userId', 'groupId'] }
                    }
                ]
            });

            //console.log(groupData.dataValues.users[0].userGroup);

            if(!groupData)  {
                throw new Error('Something went wrong');
            }
                
            return res.status(200).json({
                message: 'Group Data fetched successfully',
                groupData: groupData,
                isAdmin: user[0].userGroup.admin,
                success: true
            })
        }
    }
    catch(err) {
        //console.log(err);
        next(err);
    }
}

exports.addParticipant = async (req, res, next) => {
    const phoneNumber = req.body.phoneNumber;
    const groupId = req.body.groupId;

    try {
        /*const where = {
            where : { phoneNumber: phoneNumber },
            attributes: ['id']
        };*/

        const howMany = 'One';
        const where = {
            where : { phoneNumber: phoneNumber },
        };
        const userPromise = UserServices.findData(User, howMany, where);

        const groupPromise = req.user.getGroups({ where: { id: groupId } });

        const [group, user] = await Promise.all([ groupPromise, userPromise ]);

        if(!user)  {
            const error = new Error('User does not exist');
            error.statusCode = 404;
            throw error;
        }

        if(!group[0] || !group[0].dataValues.userGroup.dataValues.admin) {
            const error = new Error('You are not Group Member or Admin');
            error.statusCode = 401;
            throw error;
        }

        const isMember = await group[0].hasUser(user);
        if(isMember)   {
            const error = new Error('User Already Group Member');
            error.statusCode = 403;
            throw error;
        }

        const userAdded = await group[0].addUser(user, { through: { admin: false } });

        if(userAdded)   {
            res.status(201).json({
                message: `${user.dataValues.fullName} added into ${group[0].dataValues.groupName} Group`,
                userAddedData: userAdded,
                //usersData: user,
                success: true
            });
        }
    } 
    catch (err) {
        //console.log(err);
        if(err.name === 'SequelizeValidationError' || 'SequelizeUniqueConstraintError') {
            err.statusCode = 400;
        }
        next(err);
    }
}

exports.updateAdminData = async (req, res, next) => {
    const userId = req.body.userId;
    const groupId = req.body.groupId;
    const isAdmin = req.body.isAdmin;
    try {
        const groupPromise = req.user.getGroups({ where: { id: groupId } });

        const howMany = 'One';
        const where = {
            where : { id: userId },
        };
        const userPromise = UserServices.findData(User, howMany, where);

        const [group, user] = await Promise.all([ groupPromise, userPromise ]);

        if(!group[0].dataValues.userGroup.dataValues.admin)  {
            const error = new Error('You are not Group Admin');
            error.statusCode = 401;
            throw error;
        }

        if(!user)  {
            const error = new Error('User does not exist');
            error.statusCode = 404;
            throw error;
        }

        const isMember = await group[0].hasUser(user);
        if(!isMember)   {
            const error = new Error('User Not a Group Member');
            error.statusCode = 404;
            throw error;
        }

        const updatedAdminData = await group[0].addUser(user, { through: { admin: isAdmin } });
        const message = isAdmin ? `${user.dataValues.fullName} is now ${group[0].groupName} Group Admin` :
                            `${user.dataValues.fullName} removed as ${group[0].groupName} Group Admin`;

        if(updatedAdminData)   {
            res.status(200).json({
                message: message,
                updatedUserData: updatedAdminData,
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

exports.removeParticipantData = async (req, res, next) => {
    const userId = req.body.userId;
    const groupId = req.body.groupId;

    try {
        if(req.user.id === userId)  {
            const isMember = await req.user.getGroups({ where: { id: groupId } });
            
            if(!isMember) {
                const error = new Error('User is not a Group Member');
                error.statusCode = 404;
                throw error;
            }

            if(isMember[0].userGroup.admin) {
                const group = await Group.findByPk(groupId);
                const groupUsersList = await group.getUsers();
                let memberCount = 0, adminCount = 0;
                groupUsersList.forEach(val => {
                    if(val.userGroup.admin) {
                        adminCount++;
                    }
                    memberCount++;
                });
                if(adminCount <= 1) {
                    if(memberCount > 1) {
                        const error = new Error('You are the only Admin, make someone else admin before leaving the group');
                        error.statusCode = 403;
                        throw error;
                    }
                    else {
                        const error = new Error('You are the only Member & Admin, Delete this group this group instead of exiting');
                        error.statusCode = 403;
                        throw error;
                    }
                }
            }

            const exitParticipant = await isMember[0].removeUser(req.user);
            if(!exitParticipant) {
                throw new Error('Something went wrong');
            }

            const message = `${req.user.fullName} exits from ${isMember[0].groupName} group`;       
            return res.status(200).json({
                message: message,
                success: true
            });
        }
        else {
            const howMany = 'One';
            const where = {
                where : { id: userId },
            };
            const userPromise = UserServices.findData(User, howMany, where);
            const groupPromise = req.user.getGroups({ where: { id: groupId } });

            const [user, group] = await Promise.all([ userPromise, groupPromise ]);

            if(!group[0].dataValues.userGroup.dataValues.admin)  {
                const error = new Error('You are not Group Admin');
                error.statusCode = 401;
                throw error;
            }

            if(!user)  {
                const error = new Error('User does not exist');
                error.statusCode = 404;
                throw error;
            }

            const isMember = await group[0].hasUser(user);
            if(!isMember)   {
                const error = new Error('User Not a Group Member');
                error.statusCode = 404;
                throw error;
            }

            const removedParticipant = await group[0].removeUser(user);
            if(!removedParticipant) {
                throw new Error('Something went wrong');
            }

            const message = `${user.dataValues.fullName} removed from ${group[0].dataValues.groupName} group`;
            return res.status(200).json({
                message: message,
                success: true
            });
        }
    } 
    catch (err) {
        //console.log(err);
        if(err.name === 'SequelizeValidationError' || 'SequelizeUniqueConstraintError') {
            err.statusCode = 400;
        }
        next(err);
    }   
}

exports.renameGroup = async (req, res, next) => {
    try {
        const renamedGroupName = req.body.groupName;
        const groupId = req.params.id;

        const group = await req.user.getGroups({ where: { id: groupId } });

        const oldGroupName = group[0].groupName;

        group[0].groupName = renamedGroupName;
        const groupRenamed = await UserServices.saveData(group[0]);
        //console.log(groupRenamed);

        if(groupRenamed) {
            res.status(201).json({
                message: `${oldGroupName} group name changed to ${renamedGroupName}`,
                updatedGroupData: groupRenamed,
                success: true
            });
        }
    } 
    catch (err) {
        //console.log(err);
        if(err.name === 'SequelizeValidationError' || 'SequelizeUniqueConstraintError') {
            err.statusCode = 400;
        }
        next(err);
    }
}

exports.joinGroupThroughInvite = async (req, res, next) => {
    const groupInvite = req.body.groupInvite;

    try {
        const howMany = 'One';
        const where = {
            where : { groupInvite: groupInvite },
        };

        const group = await UserServices.findData(Group, howMany, where);
        //console.log(group);

        if(!group) {
            const error = new Error('Invalid Link, Group does not exist');
            error.statusCode = 404;
            throw error;
        }

        const isMember = await group.hasUser(req.user);
        //console.log(`isMember= ${isMember}`);

        if(isMember)   {
            const error = new Error('User Already Group Member');
            error.statusCode = 403;
            throw error;
        }

        const userAdded = await group.addUser(req.user, { through: { admin: false } });

        if(userAdded)   {
            res.status(201).json({
                message: `${req.user.fullName} joined ${group.groupName} Group`,
                userAddedData: userAdded,
                groupData: group,
                success: true
            });
        }
    } 
    catch (err) {
        //console.log(err);
        if(err.name === 'SequelizeValidationError' || 'SequelizeUniqueConstraintError') {
            err.statusCode = 400;
        }
        next(err);
    }   
}