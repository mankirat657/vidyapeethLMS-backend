import express from "express";
import { registerUser } from "../controller/auth.controller.js";
import multer from "multer";
const router = express.Router();
/*setting up images with the help of multer */
const upload = multer({storage : multer.memoryStorage()})
router.post("register",upload.single("image"),registerUser)



export default router;