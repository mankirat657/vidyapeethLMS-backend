import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    answerText: { type: String, required: true },
    isAiGenerated: { type: Boolean, default: false }
});

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        minlength: [4, "Minimum length of question should be 4"],
        maxlength: [500, "Maximum length of question should be 500"]
    },
    questionType: {
        type: String,
        enum: ["Multiple_Choice", "Fill_In_The_Blanks", "Long_Answers", "True/False"],
        required: true
    },
    weightage: { type: Number, default: 1 },
    isAiGenerated: { type: Boolean, default: false },
    answers: [answerSchema] 
});

const knowledgeBankContentSchema = new mongoose.Schema({
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "subject", required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    questions: { type: [questionSchema], required: true }, 
    pdf: String,
    subjectWeightage: String
}, {
    timestamps: true
});

export const contentModel = mongoose.model('bank', knowledgeBankContentSchema);
