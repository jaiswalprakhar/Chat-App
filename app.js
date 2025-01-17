const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const express = require('express');
dotenv.config({ path: './.env' });
const bodyParser = require('body-parser');
const cors = require('cors');

const morgan = require('morgan');

const errorController = require("./controllers/error");
const sequelize = require('./util/database');

const User = require('./models/user');
const Chat = require('./models/chat');

const Port = process.env.PORT || 3000;

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    //methods: ["GET"],
}));

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');

/*const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
);*/

//app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.json());

app.use('/user', userRoutes);
app.use('/chat', chatRoutes);

app.use((req, res) => {
    const urlWithoutQuery = req.path; // Extract only the path without query parameters
    res.sendFile(path.join(__dirname, `public/${urlWithoutQuery}`));
});

//Error Handle for throwing errors manually
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({ 
        err: err,
        message: err.message,
        status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
        success: false
    });
});

app.use(errorController.get404);

Chat.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Chat);

sequelize.sync()
.then(result => {
    app.listen(Port, () => {
        console.log(`Server listening at PORT ${Port}`);
    });
})
.catch(err => {
    console.log(err);
})