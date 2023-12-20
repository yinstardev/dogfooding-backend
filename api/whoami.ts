import express from 'express';
import passport from 'passport';
import logging from '../source/config/logging';

const app = express();
app.use(passport.initialize());

app.get('/whoami', (req, res) => {
    if (!req.isAuthenticated()) {
        logging.info('User not authenticated');
        return res.status(401).json({ message: 'Unauthorized' });
    } else {
        logging.info('User authenticated');
        logging.info(req.user);
        return res.status(200).json({ user: req.user });
    }
});

export default app;
