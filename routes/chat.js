const path = require('path');
const express = require('express');

const chatController = require('../controllers/chat');
const userAuthentication = require('../middlewares/auth');

const router = express.Router();

router.post('/create-chat', userAuthentication.authenticate, chatController.postChat);

module.exports = router;