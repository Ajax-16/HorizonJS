import { HorizonConfig } from "../shared/config.js";
import { transporter } from "./mailer.config.js"

const sendMail = async ({mail, from = "Support", to}) => {
    
    const email = HorizonConfig.getInstance().emailConfig.user;

    if(!to || to.length === 0) return false;
    transporter.sendMail({
        from: `${from} <${email}>`,
        // ocultar remitentes a los receptores del correo y enviarlo en masa
        bcc: to,
        subject: mail.subject,
        html: mail.getBody(),
    });
    return true;
}

export {
    sendMail
}