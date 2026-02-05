import express from "express";
import { loginUser, registerUser } from "../controller/auth.controller.js";
import multer from "multer";
const router = express.Router();

/*setting up images with the help of multer */
const upload = multer({storage : multer.memoryStorage()})

/*authetication routes */
router.post("/register",upload.single("file"),registerUser)
router.post("/login",loginUser)


export default router;