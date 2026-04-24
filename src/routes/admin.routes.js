import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { blockStudent, createQuestionAnswers, createSubject, deleteContent, deleteQuestionAnswer, deleteSubject, getQuestionAnswers, getStudents, getSubject, unblockStudent, updateQuestionAnswer, updateSubject, viewStudentResult } from "../controller/admin.controller.js";
import multer from "multer";
import { createTest, getPrevTest, validateTest } from "../controller/test.controller.js";
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
router.get("/admin/getSubject",verifyUser,getSubject) //✅
router.post("/admin/createSubject",verifyUser,createSubject) //✅
router.post('/admin/updateSubject/:id',verifyUser,updateSubject) // ✅
router.delete('/admin/deleteSubject/:id',verifyUser,deleteSubject) // ✅

/*Question/Answers routes */
router.get('/admin/getQuestionAnswers/:id',verifyUser,getQuestionAnswers)
router.post('/admin/questionAnswers/:id',verifyUser,upload.single("file"),createQuestionAnswers) /*manual creation and ai creation */
router.post(
  '/admin/updateQuestionAnswer/:id/question/:quesId/answer/:ansId',
  verifyUser,
  updateQuestionAnswer
);
router.post('/admin/deleteQuestionAnswer/:id/questionAnswerId/:quesid',verifyUser,deleteQuestionAnswer)
router.delete('/admin/deleteContent/:id', verifyUser, deleteContent);

/***************knowledge Bank api ends here *************************/
/****** testApi's start from here ******/
router.get('/admin/getTest/:id',verifyUser,getPrevTest)
router.post('/admin/createTest/:id',verifyUser,createTest) /* manual or ai creation */
router.post('/admin/validateTest/:testId/:subjectId',verifyUser,validateTest)
/* block/unblock api's */
router.get('/admin/getStudents',verifyUser,getStudents)
router.post('/admin/block/:stuId',verifyUser,blockStudent)
router.post('/admin/unblock/:stuId',verifyUser,unblockStudent)
router.get('/admin/studentResult/:stuId/:subId',verifyUser,viewStudentResult)

export default router