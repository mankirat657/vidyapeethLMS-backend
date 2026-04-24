
import mongoose from "mongoose";
import { questionModel } from "../model/question.model.js";
import { testModel } from "../model/test.model.js";
import { generateTest, validateAiTest } from "../service/ai.service.js";
import { resultModel } from "../model/result.model.js"
export const getPrevTest = async(req,res) => {
    try {
        const {id : subjectId} = req.params;
        if(!subjectId){
            return res.status(403).json({
                message : "Subject Id needed!"
            })
        }
        const getTest = await testModel.find({subject : subjectId}).populate('questions');
        console.log(getTest);
        
        return res.status(200).json({
            message : "test fetched successfully",
            getTest
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message : `error occured ${error}`
        })
    }
}
export const createTest = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id: subjectId } = req.params;
        const { testQuestions, testDuration, prompt } = req.body;
        if (!prompt && !testQuestions?.length) {
            return res.status(400).json({
                message: " testQuestions are required"
            })
        }
        if (!subjectId || !testDuration) {
            return res.status(400).json({
                message: "subjectId, testDuration  are required"
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "only admin has right to create and publish test"
            });
        }
        if (prompt) {
            const generatedQuestions = await generateTest(prompt);
            let formattedQuestions;
            try {
                formattedQuestions = JSON.parse(generatedQuestions);
            } catch (err) {
                throw new Error("AI returned invalid JSON");
            }

            const createdQuestions = await questionModel.insertMany(
                formattedQuestions.map(q => ({
                    ...q,
                    subject: subjectId,
                    admin: req.user._id
                }))
            )
            const questionIds = createdQuestions.map(q => q._id);
            const test = await testModel.create(
                [{
                    admin: req.user._id,
                    subject: subjectId,
                    questions: questionIds,
                    testDuration: testDuration
                }],
                { session }
            )
            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({
                message: "test created successfully",
                getTest: test
            })
        }
        const createdQuestions = await questionModel.insertMany(
            testQuestions.map(q => ({
                ...q,
                subject: subjectId,
                admin: req.user._id
            })),
        );

        const questionIds = createdQuestions.map(q => q._id);

        const test = await testModel.create(
            [{
                admin: req.user._id,
                subject: subjectId,
                questions: questionIds,
                testDuration
            }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: "Test created successfully",
            // testId: test[0]._id
            getTest : test
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        return res.status(500).json({
            message: `error occurred: ${error.message}`
        });
    }
};
export const validateTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const { subjectId } = req.params;
        const { answers } = req.body;
        if (!testId || !answers?.length) {
            return res.status(400).json({
                message: "testId and answers are required"
            })
        }
        const existingAttempt = await resultModel.findOne({ testId: testId, student: req.user._id });
        if (existingAttempt) {
            return res.status(400).json({
                message: "multiple attempts are not allowed"
            })
        }
        const test = await testModel.findById(testId).populate("questions");

        if (!test) {
            return res.status(400).json({
                message: "Test not found"
            })
        }
        let totalScore = 0;
        const evaluatedAnswers = [];

        for (const question of test.questions) {
            const studentAnswer = answers.find(
                a => a.questionId === question._id.toString()
            )
            if (!studentAnswer) continue;
            const writtenAnswer =
                studentAnswer.writtenAnswer || studentAnswer.answerText || null;
                console.log(writtenAnswer);
                
            let isCorrect = false;
            let marksObtained = 0;
            if (question.questionType === "Multiple_Choice" || question.questionType === "True/False") {
                const correctIndex = question.answers.findIndex(
                    ans => ans.isCorrect === true
                );
                if (correctIndex === -1) {
                    throw new Error("No correct answer defined for question");
                }

                isCorrect = studentAnswer.selectedOptionIndex === correctIndex;


                if (isCorrect) {
                    marksObtained = question.totalMarks;
                    totalScore += marksObtained;
                }

            }
            if (question.questionType === "Long_Answers" && question) {
                if (!writtenAnswer) {
                    marksObtained = 0;
                    isCorrect = false;
                } else {
                    const modelAnswer = question.answers[0]?.answerText;

                    const aiResult = await validateAiTest(
                        writtenAnswer,
                        modelAnswer,
                        question.totalMarks
                    );

                    marksObtained = Math.min(
                        Math.max(aiResult.marksObtained || 0, 0),
                        question.totalMarks
                    );

                    totalScore += marksObtained;
                    isCorrect = marksObtained > 0;
                }
            }



            evaluatedAnswers.push({
                question: question._id,
                selectedOptionIndex: studentAnswer.selectedOptionIndex ?? null,
                writtenAnswer,
                isCorrect,
                marksObtained
            });


        }
        const attempt = await resultModel.create({
            student: req.user._id,
            subject: subjectId,
            testId: testId,
            totalAttempted: evaluatedAnswers.length,
            answers: evaluatedAnswers,
            TotalScore: totalScore,
        });
        return res.status(201).json({
            message: "Test submitted successfully",
            score: totalScore,
            attemptId: attempt._id
        });
    } catch (error) {
        return res.status(500).json({
            message: `error occured ${error}`
        })
    }
}