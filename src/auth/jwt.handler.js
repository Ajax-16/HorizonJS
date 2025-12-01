import jwt from "jsonwebtoken";
import { HorizonConfig } from "../shared/config.js";

const JWT_SECRET = HorizonConfig.getInstance().jwtSecret;

const generateToken = (id) =>{
    const token = jwt.sign(id, JWT_SECRET);
    return token;
}

const verifyToken = (token) => {
    const isValid = jwt.verify(token, JWT_SECRET);
    return isValid;
}

export {generateToken, verifyToken};
