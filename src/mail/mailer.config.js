import nodemailer from 'nodemailer'
import { displayLogs } from '../shared/logger.js';
import { HorizonConfig } from '../shared/config.js';

const user = HorizonConfig.getInstance().emailConfig.user
const pass = HorizonConfig.getInstance().emailConfig.password

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ovh.net',
    port: 465,
    secure: true,
    auth: {
        user: user,
        pass: pass
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
