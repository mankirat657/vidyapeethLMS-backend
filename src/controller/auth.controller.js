import validate from "deep-email-validator";
import crypto from 'crypto'
import { sendVerificationEmail } from "../service/email.service.js";
import { userModel } from "../model/auth.model.js";
import { uploadFile } from "../service/storage.service.js";
import { v4 } from "uuid";
import bcrypt from "bcryptjs";
export const registerUser = async(req,res) =>{
     try {
    const file = req.file;
    const {fullName : {firstName , lastName},email,password, } = req.body;
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
        isVerified:"false",
        verificationToken : verificationToken,
        picture : result.url,
        role : "user"
        
    })
    await sendVerificationEmail(email,verificationToken)
    return res.json(201).json({
        message : "user registered, please verify your email",
        newUser
    })
    } catch (error) {   
        return res.status(500).json({
            message : `error occured while register ${error}`
        })
    }
}