import fs from 'fs';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Strategy } from 'passport-saml';
import config from './config';
import logging from './logging';



const jwt_secret = process.env.JWT_SECRET || '';

const savedUsers: Express.User[] = [];

passport.serializeUser<Express.User>((expressUser, done) => {
    logging.info(expressUser, 'Serialize User');
    done(null, expressUser);
});

passport.deserializeUser<Express.User>((expressUser, done) => {
    logging.info(expressUser, 'Deserialize User');

    done(null, expressUser);
});

passport.use(
    new Strategy(
        {
            issuer: config.saml.issuer,
            protocol: 'http://',
            path: '/login/callback',
            entryPoint: config.saml.entryPoint,
            cert: fs.readFileSync(config.saml.cert, 'utf-8')
        },
        (expressUser: any, done: any) => {
            if (!savedUsers.includes(expressUser)) {
                savedUsers.push(expressUser);
            }
            const jwtToken = jwt.sign(
                { username: expressUser.nameID },
                jwt_secret,
                { expiresIn: '24h' }
            );

            expressUser.jwtToken = jwtToken;

            return done(null, expressUser);
        }
    )
);
