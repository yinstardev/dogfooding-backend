const config = {
    saml: {
        cert: './source/config/saml.pem',
        entryPoint: `${process.env.ENTRY_POINT}`,
        issuer: 'http://localhost:1337',
        options: {
            failureRedirect: '/login',
            failureFlash: true
        }
    },
    server: {
        port: 1337
    },
    session: {
        resave: false,
        secret: `${process.env.SECRET}`,
        saveUninitialized: true
    }
};

export default config;
