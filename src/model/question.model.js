import mongoose from "mongoose";


const answerSchema = new mongoose.Schema({
  answerText: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  isAiGenerated: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 500
  },
  questionType: {
    type: String,
    enum: ["Multiple_Choice", "Fill_In_The_Blanks", "Long_Answers", "True/False"],
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  answers: [answerSchema],
  isAiGenerated: {
    type: Boolean,
    default: false
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subject",
    index: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    index: true
  }
}, { timestamps: true });


export const questionModel = mongoose.model("question",questionSchema);