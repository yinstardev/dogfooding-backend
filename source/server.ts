import http from 'http';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import logging from './config/logging';
import config from './config/config';
import axios from 'axios';
import './config/passport';

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

/** Passport & SAML Routes */
// app.get('/login', passport.authenticate('saml', config.saml.options), (req, res, next) => {
//     return res.redirect('http://localhost:3000');
// });

// app.post('/login/callback', passport.authenticate('saml', config.saml.options), (req, res, next) => {
//     return res.redirect('http://localhost:3000');
// });

// app.get('/whoami', (req, res, next) => {
//     if (!req.isAuthenticated()) {
//         logging.info('User not authenticated');

//         return res.status(401).json({
//             message: 'Unauthorized'
//         });
//     } else {
//         logging.info('User authenticated');
//         logging.info(req.user);


//         return res.status(200).json({ user: req.user });
//     }
// });

// app.get('/healthcheck', (req, res, next) => {
//     return res.status(200).json({ messgae: 'Server is running!' });
// });

// app.post('/getAuthToken', async (req, res) => {
//     try {
//         const postData = `secret_key=${process.env.SECRET_KEY}&username=${process.env.EMAIL}.com&access_level=FULL`;
//         const response = await axios.post(`${process.env.BASE_URL}`, postData, {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'Accept': 'text/plain'
//             }
//         });

//         res.json(response.data);
//     } catch (error) {
//         console.error('Error fetching auth token:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });


import loginRoute from './api/login';
import loginCallbackRoute from './api/loginCallback';
import whoamiRoute from './api/whoami';
import healthcheckRoute from './api/healthCheck';

// Use the routes
app.use(loginRoute);
app.use(loginCallbackRoute);
app.use(whoamiRoute);
app.use(healthcheckRoute);


app.use((req, res, next) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

httpServer.listen(config.server.port, () => logging.info(`Server is running on port ${config.server.port}`));

export default app;
