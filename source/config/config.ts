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
const tempDir = os.tmpdir();
const tempCertPath = path.join(tempDir, 'saml.pem');

fs.writeFileSync(tempCertPath, certContent);
console.log(`SAML certificate written to ${tempCertPath}`);


const config = {
    saml: {
        cert: tempCertPath,
        entryPoint: getEnvVariable('ENTRY_POINT'),
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
        secret: getEnvVariable('SECRET'),
        saveUninitialized: true
    }
};

export default config;
