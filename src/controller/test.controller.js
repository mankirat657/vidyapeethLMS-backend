
import mongoose from "mongoose";
import { questionModel } from "../model/question.model.js";
import { testModel } from "../model/test.model.js";
import { generateTest } from "../service/ai.service.js";

export const createTest = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id: subjectId } = req.params;
        const { testQuestions, testDuration, prompt } = req.body;
        if(!prompt  && !testQuestions?.length){
            return res.status(400).json({
                message : " testQuestions are required"
            })
        }
        if (!subjectId || !testDuration ) {
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
                testId: test[0]._id
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
            testId: test[0]._id
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        return res.status(500).json({
            message: `error occurred: ${error.message}`
        });
    }
};
