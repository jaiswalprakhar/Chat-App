const User = require('../models/user');
const { generatePasswordHash, verifyPassword } = require('../util/pwdUtil');
const { generateAccessToken } = require('../util/jwtUtil');
const UserServices = require('../services/userServices');

exports.createUser = async (req, res, next) => {
    const { fullName, emailId, phoneNumber, password } = req.body;
    try {
        if(password.length < 8 || password.length > 15) {
            const error = new Error('Password should be 8 to 15 characters long');
            error.statusCode = 400;
            throw error;
        }
        const userPassword = await generatePasswordHash(password);
        
        const userData = {
            fullName: fullName,
            emailId: emailId,
            phoneNumber: phoneNumber,
            password: userPassword
        }

        const createUserData = await UserServices.createData(User, userData);

        if(createUserData)  {
            res.status(201).json({
                message: `Your account is successfully created. Go to login page.`,
                createdUserData: createUserData,
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
};

exports.loginUser = async (req, res, next) => {
    const { emailId, password } = req.body;
    try {
        const where = { where: { emailId: emailId } };
        const howMany = "One";
        const loginUserData = await UserServices.findData(User, howMany, where);
        //console.log(loginUserData);
        
        if(loginUserData)   {
            const passwordVerified = await verifyPassword(password, loginUserData.password);
            
            if(passwordVerified)  {
                const token = generateAccessToken(loginUserData.id, loginUserData.fullName);
                message = `Login Successful`;
                res.status(200).json({
                    message: message,
                    redirect: `/FRONTEND/components/Layout/chat.html`,
                    token: token,
                    success: true
                });
            }
            else  {
                const error = new Error('Incorrect Password');
                error.statusCode = 401;
                throw error;
            }
        }
        else  {
            const error = new Error('Email ID does not exist');
            error.statusCode = 404;
            throw error;
        }
    }
    catch(err) {
       //console.log(err);
       if(err.errors && err.errors.length > 0) {
            if(err.errors[0].type === 'Validation error') {
            err.statusCode = 400;
            }
       }
        next(err);
    }
};

exports.verifyLogin = (req, res, next) => {
    try {
        const message = 'User is already logged in';

        res.status(200).json({
        message: message,
        redirect: '/FRONTEND/components/Layout/chat.html',
        success: true
        });
    }
    catch(err) {
        //console.log(err);
        next(err);
    }
}