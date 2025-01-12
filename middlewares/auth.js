const { verifyAccessToken } = require('../util/jwtUtil');
const User = require('../models/user');

const authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        //console.log(token);
        const user = verifyAccessToken(token);
        //console.log(user);
        User.findByPk(user.userId)
        .then(user => {
            req.user = user;
            //console.log("Token verified");
            next();
        })
        .catch(err => {
            throw new Error(err);   
        })
    }
    catch(err) {
        //console.log(err);
        if(err.message === "jwt must be provided")
        {
            err.message = "User Not Authorised, Login Again";
        }
        return res.status(401).json({ 
            message: err.message,
            redirect: '/FRONTEND/components/Layout/login.html',
            success: false
        })
    }
}

module.exports = { authenticate };