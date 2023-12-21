import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';

dotenv.config();

function getEnvVariable(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not set.`);
    }
    return value;
}


const base64EncodedCert = getEnvVariable('SAML_CERT');
if (!base64EncodedCert) {
  throw new Error('SAML_CERT_BASE64 environment variable is not set.');
}

const certContent = Buffer.from(base64EncodedCert, 'base64').toString('utf-8');


const config = {
    saml: {
        cert: certContent,
        entryPoint: getEnvVariable('ENTRY_POINT'),
        issuer: 'http://www.okta.com/exke1hd7ea0LS78WY5d7',
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
        secret: getEnvVariable('SECRET'),
        saveUninitialized: true
    }
};

export default config;
