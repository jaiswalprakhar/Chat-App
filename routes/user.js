const path = require('path');
const express = require('express');

const userController = require('../controllers/user');
const userAuthentication = require('../middlewares/auth');

const router = express.Router();

router.post('/create-user', userController.createUser);

router.post('/login-user', userController.loginUser);

router.get('/verify-login', userAuthentication.authenticate, userController.verifyLogin);

module.exports = router;