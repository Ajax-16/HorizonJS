import jwt from "jsonwebtoken";
import { HorizonConfig } from "../shared/config.js";

const generateToken = (id) =>{
    const JWT_SECRET = HorizonConfig.getInstance().jwtSecret;
    const token = jwt.sign(id, JWT_SECRET);
    return token;
}

const verifyToken = (token) => {
    const JWT_SECRET = HorizonConfig.getInstance().jwtSecret;
    const isValid = jwt.verify(token, JWT_SECRET);
    return isValid;
}

export {generateToken, verifyToken};
