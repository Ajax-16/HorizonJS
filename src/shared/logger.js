import { format_date } from "../utils.js";
import { HorizonConfig } from "./config.js";

const logLevel = HorizonConfig.getInstance().logLevel;

export const displayLogs = (req, res, err) => {
    let status;
    if (res) {
        status = res.statusCode;
    }
    if (req && req != 'ERROR') {
        switch (logLevel) {
            case 'ERROR':
                break;
            case 'DEBUG':
                // 304 es una respuesta cacheada. No nos interesa llenar el log con estas aunque esté en DEBUG.
                if ((status >= 200 && status < 304) || (status > 304 && status < 400)) {
                    console.log(buildLog('DEBUG', `${status} - ${req.method} - ${req.originalUrl}`, req));
                }
            case 'INFO':
                if (status >= 400 && status < 500) {
                    if (err) {
                        console.log(buildLog('INFO', `${status} - ${req.method} - ${req.originalUrl} | ${err.message}`, req));
                    } else {
                        console.log(buildLog('INFO', `${status} - ${req.method} - ${req.originalUrl}`, req));
                    }
                }
                break;
            default:
                console.error(buildLog('ERROR', 'Invalid log level', req));
                break;
        }
        if (err && err.code) {
            console.error(buildLog('ERROR', `${status} - ${req.method} ${req.originalUrl} | ${err.message || err.sqlMessage || err.code}`, req));
        }
    }
    else if(req == 'ERROR') {
        status = 500;
        console.error(buildLog('ERROR', `${status} - ${res}`));
    }
}

const buildLog = (type, message, req) => {
    let remoteIP;
    if (req) {
        remoteIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    } else {
        remoteIP = 'localhost';
        type = 'INTERNAL SERVER ERROR'
    }

    return `${type} [${format_date(new Date())}] - IP: ${remoteIP} - ${message}`
}