import nodemailer from 'nodemailer';
import { envVars } from '../../config/index.js';

export const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: envVars.email.user,
        pass: envVars.email.pass,
    },
});
