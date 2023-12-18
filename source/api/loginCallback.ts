import express from 'express';
import passport from 'passport';
import config from '../config/config';
import '../config/passport';

const app = express();
app.use(passport.initialize());

app.post('/login/callback', passport.authenticate('saml', config.saml.options), (req, res) => {
    return res.redirect('http://localhost:3000');
});

export default app;
