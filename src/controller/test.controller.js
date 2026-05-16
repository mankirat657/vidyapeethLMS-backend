
import mongoose from "mongoose";
import { questionModel } from "../model/question.model.js";
import { testModel } from "../model/test.model.js";
import { generateTest, validateAiTest } from "../service/ai.service.js";
import { resultModel } from "../model/result.model.js"
import {io} from '../../server.js'
export const getAllTest = async(req,res) => {
    try {
        const test = await testModel.find().populate("questions").populate("subject");
        return res.status(200).json({
            test
        })
    } catch (error) {
        return res.status(500).json({
            message : `error occured ${error}`
        })
    }
}
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
export const startTest = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await testModel.findById(testId);

    if (!test) {
      return res.status(404).json({
        message: "Test not found",
      });
    }

    if (!test.isPublished) {
      return res.status(400).json({
        message: "Test is not published yet",
      });
    }

    if (!test.startTime || !test.endTime) {
      return res.status(400).json({
        message: "Test has not started yet",
      });
    }

    if (new Date() > test.endTime) {
      return res.status(400).json({
        message: "Test time is over",
      });
    }

    return res.status(200).json({
      message: "Test started successfully",
      startTime: test.startTime,
      endTime: test.endTime,
      serverTime: new Date(),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
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
    const { testId, subjectId } = req.params;
    const { answers } = req.body;

    if (!testId || !subjectId) {
      return res.status(400).json({
        message: "testId and subjectId are required",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message: "answers must be an array",
      });
    }

    const existingResult = await resultModel.findOne({
      testId,
      student: req.user._id,
    });

    if (existingResult) {
      return res.status(400).json({
        message: "Multiple attempts are not allowed",
      });
    }

    const testAttempt = await testAttemptModel.findOne({
      student: req.user._id,
      test: testId,
    });

    if (!testAttempt) {
      return res.status(400).json({
        message: "You must start the test first",
      });
    }

    if (testAttempt.submitted) {
      return res.status(400).json({
        message: "Test already submitted",
      });
    }

    if (new Date() > testAttempt.expiresAt) {
      return res.status(400).json({
        message: "Time is over. Test expired",
      });
    }

    const test = await testModel
      .findById(testId)
      .populate("questions");

    if (!test) {
      return res.status(404).json({
        message: "Test not found",
      });
    }

    let totalScore = 0;
    const evaluatedAnswers = [];

    for (const question of test.questions) {
      const studentAnswer = answers.find(
        (a) => a.questionId === question._id.toString()
      );

      if (!studentAnswer) continue;

      const writtenAnswer =
        studentAnswer.writtenAnswer ||
        studentAnswer.answerText ||
        null;

      let isCorrect = false;
      let marksObtained = 0;

      if (
        question.questionType === "Multiple_Choice" ||
        question.questionType === "True/False"
      ) {
        const correctIndex = question.answers.findIndex(
          (ans) => ans.isCorrect === true
        );

        if (correctIndex === -1) {
          throw new Error(
            `No correct answer defined for question ${question._id}`
          );
        }

        isCorrect =
          studentAnswer.selectedOptionIndex === correctIndex;

        if (isCorrect) {
          marksObtained = question.totalMarks;
          totalScore += marksObtained;
        }
      }

      if (question.questionType === "Long_Answers") {
        if (!writtenAnswer) {
          marksObtained = 0;
          isCorrect = false;
        } else {
          const modelAnswer =
            question.answers?.[0]?.answerText || "";

          const aiResult = await validateAiTest(
            writtenAnswer,
            modelAnswer,
            question.totalMarks
          );

          marksObtained = Math.min(
            Math.max(aiResult?.marksObtained || 0, 0),
            question.totalMarks
          );

          totalScore += marksObtained;
          isCorrect = marksObtained > 0;
        }
      }

      evaluatedAnswers.push({
        question: question._id,
        selectedOptionIndex:
          studentAnswer.selectedOptionIndex ?? null,
        writtenAnswer,
        isCorrect,
        marksObtained,
      });
    }

    const result = await resultModel.create({
      student: req.user._id,
      subject: subjectId,
      testId,
      totalAttempted: evaluatedAnswers.length,
      answers: evaluatedAnswers,
      TotalScore: totalScore,
    });

    testAttempt.submitted = true;
    await testAttempt.save();

    return res.status(201).json({
      message: "Test submitted successfully",
      score: totalScore,
      resultId: result._id,
    });
  } catch (error) {
    console.error("validateTest error:", error);

    return res.status(500).json({
      message: `Error occurred: ${error.message}`,
    });
  }
};
export const publishTest = async(req,res)=>{
  try {
    const {testId} = req.params;
    if(!testId) return res.status(400).json({message : "testId needed"});
 
    const existingTest = await testModel.findById(testId);

    if (!existingTest) {
      return res.status(404).json({
        message: "Test not found",
      });
    }
       const startTime = new Date();
    const endTime = new Date(
      startTime.getTime() + existingTest.testDuration * 60 * 1000
    );
    const test = await  testModel.findByIdAndUpdate(testId,{isPublished : true,startTime,endTime},{new : true  }).populate("subject");
    if(!test) return res.status(400).json({message : "there is no test associated with this id"})
    io.to("students").emit("testPublished",test);
    return res.status(200).json({
      message : "test has been published",
      test
    })

  } catch (error) {
    console.log(error);
    
    return res.status(500).json({message : `error occured ${error}`})
  }
}
export const deleteTest = async(req,res)=>{
  try {
    const{testId} = req.params;

    await testModel.findByIdAndDelete(testId);
    return res.status(200).json({message : "test successfully deleted"});
  } catch (error) {
    return res.status(403).json({message : `error occured ${error}`});
  }
}
