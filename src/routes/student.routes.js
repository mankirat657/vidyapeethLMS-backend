import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { getMaterial, getResult } from "../controller/student.controller.js";

const router = express.Router();
/* view results */
router.get('/getResult/:stuId/:subId',verifyUser,getResult)
/* view knowledge bank */
router.get('/knowledgeBank/:subId',verifyUser,getMaterial)
export default router;