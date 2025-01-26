const path = require('path');
const express = require('express');

const chatController = require('../controllers/chat');
const userAuthentication = require('../middlewares/auth');

const router = express.Router();

router.get('/count-chat', userAuthentication.authenticate, chatController.countChats);

router.post('/create-chat', userAuthentication.authenticate, chatController.postChat);

router.get('/get-chats', userAuthentication.authenticate, chatController.getChats);

module.exports = router;