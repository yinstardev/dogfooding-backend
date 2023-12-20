import http from 'http';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import logging from './config/logging';
import config from './config/config';
import axios from 'axios';
import './config/passport';
import jwt from 'jsonwebtoken';
import { validateToken } from './middleware/validateToken';

require('dotenv').config();

const app = express();

const httpServer = http.createServer(app);

app.use((req, res, next) => {
    logging.info(`METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        logging.info(`METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });

    next();
});

app.use(session(config.session));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.header('origin'));
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

app.get('/',(req,res) => {
    res.status(200).json({
        "Status":"Server Running",
        "PORT" : "1337"
    })
})


app.get('/login', passport.authenticate('saml', config.saml.options), (req, res) => {
    return res.redirect('http://localhost:3000');
});

// app.post('/login/callback', (req, res, next) => {
//     passport.authenticate('saml', config.saml.options, (err: any, user: any, info: any) => {
//         if (err) {
//             return next(err); // Handle authentication error
//         }
//         if (!user) {
//             return res.redirect('/login-failure'); // Handle failed authentication
//         }

//         // User is authenticated, use the JWT token generated in the Passport strategy
//         const jwtToken = user.jwtToken;
//         res.redirect(`http://localhost:3000/token-handler?token=${jwtToken}`);
//     })(req, res, next);
// });

app.post('/login/callback', passport.authenticate('saml', config.saml.options), (req:any, res, next) => {
    // if(req.isAuthenticated()){
        res.redirect(`http://localhost:3000/token-handler?token=${req.user.jwtToken}`)
    // }
    // return res.redirect('http://localhost:3000');
});



app.get('/whoami', (req, res, next) => {
    logging.info('User authenticated');
    logging.info(req.user);
    return res.status(200).json({ user: req.user });
});

app.get('/healthcheck', (req, res, next) => {
    return res.status(200).json({ messgae: 'Server is runngggging!' });
});

app.post('/getauthtoken', async (req, res:any) => {

        const postData = `secret_key=${process.env.SECRET_KEY}&username=${process.env.EMAIL}.com&access_level=FULL`;
        const response = await axios.post(`${process.env.BASE_URL}`, postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/plain'
            }
        });

        res.status(200).json(response.data);

});

app.get('/checkbhai', validateToken,async(req,res) => {
    console.log("ye to bekar hai");
    
    res.status(200).json({"bhai":"kaisa hai"})
})


const jwt_secret = process.env.JWT_SECRET || '';

app.get('/validate-token', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, jwt_secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        res.json({ valid: true, user: decoded });
    });
});


import getColumnsData from './api/getColumnsData'

app.use(getColumnsData);




app.use((req, res, next) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

httpServer.listen(config.server.port, () => logging.info(`Server is running on port ${config.server.port}`));

export default app;