import { Response } from "../models/response.js";
import { verifyToken } from "../auth/jwt.handle.js";

const checkJWT = (req, res, next) => {
    try {
        const unAuthResponse = new Response({body: 'UNAUTHORIZED REQUEST', status: 401});
        
        if (!req.headers.authorization) {
            return res.status(unAuthResponse.getStatus()).send(unAuthResponse);
        }

        const jwtUser = req.headers.authorization
        const jwt = jwtUser.split(' ').pop();

        if (jwt === 'null' || jwt === 'undefined') {
            return res.status(unAuthResponse.getStatus()).send(unAuthResponse);
        }
    
        const payload = verifyToken(`${jwt}`)

        if (!payload) {
            unAuthResponse.setBody('INVALID SESSION TOKEN');
            return res.status(unAuthResponse.getStatus()).send(unAuthResponse);
        } else {
            req.user = payload;
            req.privileged = false;
            next();
        }
    }catch (err) {
        const errorResponse = new Response({
            body: err.code, 
            status: 500
        });
        res.status(errorResponse.getStatus()).send(errorResponse)
    }
}

export { checkJWT };
