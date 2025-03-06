const path = require('path');
const express = require('express');

const groupController = require('../controllers/group');
const userAuthentication = require('../middlewares/auth');

const router = express.Router();

router.post('/create-group', userAuthentication.authenticate, groupController.createGroup);

router.get('/get-persons-groups-list', userAuthentication.authenticate, groupController.getGroupOrPersonList);

router.get('/get-group-data/:id', userAuthentication.authenticate, groupController.getGroupData);

router.post('/add-participant', userAuthentication.authenticate, groupController.addParticipant);

router.patch('/update-admin', userAuthentication.authenticate, groupController.updateAdminData);

router.delete('/remove-participant', userAuthentication.authenticate, groupController.removeParticipantData);

router.patch('/rename-group/:id', userAuthentication.authenticate, groupController.renameGroup);

router.post('/join-group-invite', userAuthentication.authenticate, groupController.joinGroupThroughInvite);

module.exports = router;