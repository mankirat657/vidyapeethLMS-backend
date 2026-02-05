import jwt from "jsonwebtoken"
import { userModel } from "../model/auth.model.js";
export const verifyUser = async(req,res,next) =>{
    try {
        const { token } = req.cookies;
        if(!token){
            return res.status(400).json({
                message : "Authentication error token not provided"
            })
        }
        /*verifying the token */
        const decoded =jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.user);
        console.log(decoded);
        
        req.user = user;
        next();
        
    } catch (error) {
        return res.status(500).json({
            message : `Invalid Token ${error}`
        })
    }
}