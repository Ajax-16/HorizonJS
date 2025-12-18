import nodemailer from 'nodemailer'
import { displayLogs } from '../shared/logger.js';
import { HorizonConfig } from '../shared/config.js';

const getUser = () => {
    const user = HorizonConfig.getInstance().emailConfig.user
    return user;
}

const getPass = () => {
    const pass = HorizonConfig.getInstance().emailConfig.password
    return pass;
}

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ovh.net',
    port: 465,
    secure: true,
    auth: {
        user: getUser(),
        pass: getPass()
    },
    tls: {
        rejectUnauthorized: true
    }
})

transporter.verify().then(() => {
    console.log("-> Mail server connection succesfully created.")
})
    .catch(error => displayLogs('ERROR', 'Mail server connection error', error));

export { transporter }
