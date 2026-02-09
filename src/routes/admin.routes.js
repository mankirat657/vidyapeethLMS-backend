import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { createQuestionAnswers, createSubject, deleteQuestionAnswer, deleteSubject, updateQuestionAnswer, updateSubject } from "../controller/admin.controller.js";
import multer from "multer";
import { createTest, validateTest } from "../controller/test.controller.js";
const router = express.Router();
const upload = multer({storage : multer.memoryStorage()})

/*
POST : admin can create knowledgeBank // done
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
router.post('/questionAnswers/:id',verifyUser,upload.single("file"),createQuestionAnswers) /*manual creation and ai creation */
router.post(
  '/updateQuestionAnswer/:id/question/:quesId/answer/:ansId',
  verifyUser,
  updateQuestionAnswer
);
router.post('/deleteQuestionAnswer/:id/questionAnswerId/:quesid',verifyUser,deleteQuestionAnswer)
/***************knowledge Bank api ends here *************************/
/****** testApi's start from here ******/
router.post('/createTest/:id',verifyUser,createTest) /* manual or ai creation */
router.post('/validateTest/:testId/:subjectId',verifyUser,validateTest)

export default router