import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { createSubject, deleteSubject, updateSubject } from "../controller/admin.controller.js";

const router = express.Router();

/*
POST : admin can create knowledgeBank
POST : admin can post Question answers in KnowledgeBank(can also generate through ai)
POST : admin can edit question answers in particular knowledegeBank
POST : admin can generateTest and publish it (manually or through ai)
POST : admin can block and unblock student
POST : admin can view Performance of students

*/
/*subject api's */

router.post("/createSubject",verifyUser,createSubject)
router.post('/updateSubject/:id',verifyUser,updateSubject)
router.delete('/deleteSubject/:id',verifyUser,deleteSubject)

/*Question/Answers routes */


export default router