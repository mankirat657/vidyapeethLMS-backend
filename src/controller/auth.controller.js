import {validate} from "deep-email-validator";
import crypto from 'crypto'
import { forgotPasswordEmail, sendVerificationEmail } from "../service/email.service.js";
import { userModel } from "../model/auth.model.js";
import { uploadFile } from "../service/storage.service.js";
import { v4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
export const registerUser = async(req,res) =>{
     try {
    const file = req.file;
    const {firstName , lastName,email,password,course } = req.body;
    if(!firstName || !lastName || !email || !password){
        return res.status(400).json({
            message : "firstName, lastName, email or password is required"
        })
    }
    //checking if user already exist
    const user = await userModel.findOne({email})
    if(user){
        return res.status(400).json({
            message :"user already registered"
        })
    }
    //validating the email
    const validationResult = await validate(email);

    if(!validationResult.valid){
        return res.status(400).json({
            status : "error",
            message : "Email is not valid. Please try again",
            reason : validationResult.reason
        })
    }
    const result = await uploadFile(file.buffer,`${v4()}`)
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const newUser = await userModel.create({
        fullName : {
            firstName : firstName,
            lastName : lastName
        },
        email : email,
        password : hashedPassword,
        authProvider : "local",
        isVerified:false,
        verificationToken : verificationToken,
        picture : result.url,
        role : "user",
        course : course
        
    })
    await sendVerificationEmail(email,verificationToken)
    const token = jwt.sign({user : newUser._id},process.env.JWT_SECRET);
    res.cookie("token",token);
    return res.status(201).json({
        message : "user registered, please verify your email",
        newUser
    })
    } catch (error) {   
        return res.status(500).json({
            message : `error occured while register ${error}`
        })
    }
}
export const loginUser = async(req,res) => {
    try {
        const {email , password}  = req.body;
        if(!email || !password){
            return res.status(400).json({
                message : "email or password is missing"
            })
        }
        const user = await userModel.findOne({email}).select("+password");
        if(!user){
            return res.status(400).json({
                message : "Not Authenticated - user not found please signup"
            })
        }
        if(!user.isVerified){
            return res.status(400).json({
                message : "user is not verified please verify again to continue"
            })
        }
        const passwordMatch = await bcrypt.compare(password,user.password);
        if(!passwordMatch){
            return res.status(400).json({
                message : "Authentication Error - password doesnot matched try again"
            })
        }
        const token =jwt.sign({user : user._id}, process.env.JWT_SECRET);
        res.cookie("token",token);

        return res.status(200).json({
            message : "user successfully logged in",
            user
        })
    } catch (error) {
    return res.status(500).json({
        message : `error occurred ${error}`
    })       
    }   
}
export const logoutUser = async(req,res) => {
    try {
        res.cookie("token","");

        return res.status(200).json({
            message : "user logout successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message : "error occured while logout"
        })        
    }
}
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        await forgotPasswordEmail(email, token);

        res.json({ message: "Reset password email sent. Check your inbox!" });
    } catch (error) {
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};
export const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        if (!email || !token || !newPassword) {
            return res.status(400).json({ message: "Email, token, and new password are required" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await userModel.findOne({
            email,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successful!" });
    } catch (error) {
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};