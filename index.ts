import http from 'http';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import logging from './source/config/logging';
import config from './source/config/config';
import axios from 'axios';
import './source/config/passport';
import jwt from 'jsonwebtoken';
import { validateToken } from './source/middleware/validateToken';

require('dotenv').config();

const app = express();

const httpServer = http.createServer(app);
const fe_url = process.env.FE_URL || "";

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
    // res.header('Access-Control-Allow-Origin', "*");
    // res.header('Access-Control-Allow-Origin', 'https://example.com');
    const allowedOrigins = ['https://dog-fooding-application-git-backend-testing-for-api-yinstardev.vercel.app'];
    const origin = req.headers.origin || 'http://localhost:3000';
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }

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
    return res.redirect(`${fe_url}/dashboard`);
});
// app.get('/login/callback', (req, res) => {
//     // Extract the SAMLResponse query parameter
//     const samlResponse = req.query.SAMLResponse; // Adjust according to what data you expect
//     const data = req;
//     res.send(`
//         <html>
//             <body>
//                 <script>
//                     const samlResponse = '${samlResponse}'; 
                    
//                     // Construct the data to be sent in the POST request
//                     const data = {
//                         SAMLResponse: samlResponse
//                         // Add other data if needed
//                     };
//                     console.log(data);

//                     fetch('/login/callback', {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json',
//                             // Include any other necessary headers
//                         },
//                         body: JSON.stringify(data)
//                     })
//                     .then(response => {
//                         if (response.redirected) {
//                             window.location.href = response.url;
//                         }
//                     })
//                     .catch(error => console.error('Error:', error));
//                 </script>
//             </body>
//         </html>
//     `);
// });


app.post('/login/callback', passport.authenticate('saml', config.saml.options), (req:any, res, next) => {
    // if (req.user && req.user.jwtToken) {
        res.redirect(`${fe_url}/token-handler?token=${req.user.jwtToken}`);
    // }else{
    //     res.json({"Hi THere : something went wrong": "Check routes"})
    // }
});

app.get('/whoami', (req, res, next) => {
    logging.info(req.user);
    return res.status(200).json({ user: req.user });
});

app.get('/healthcheck', (req, res, next) => {
    return res.status(200).json({ messgae: 'Server is runngggging!' });
});

app.post('/getauthtoken',async (req, res:any) => {

        const postData = `secret_key=${process.env.SECRET_KEY}&username=${process.env.EMAIL}.com&access_level=FULL`;
        const response = await axios.post(`${process.env.BASE_URL}`, postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/plain'
            }
        });

        res.status(200).json(response.data);

});

app.post('/checkbhai',async(req,res) => {
    
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

app.use((req, res, next) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

httpServer.listen(config.server.port, () => logging.info(`Server is running on port ${config.server.port}`));

export default app;