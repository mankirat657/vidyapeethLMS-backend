import express from "express";
import { forgotPassword, getMe, loginUser, logoutUser, registerUser, resetPassword } from "../controller/auth.controller.js";
import multer from "multer";
const router = express.Router();

/*setting up images with the help of multer */
const upload = multer({storage : multer.memoryStorage()})

/*authetication routes */
router.post("/register",upload.single("file"),registerUser)
router.post("/login",loginUser)
router.post("/forgotPassword",forgotPassword)
router.post('/resetPassword',resetPassword);
router.delete("/logout",logoutUser)
router.get("/me", getMe);

export default router;