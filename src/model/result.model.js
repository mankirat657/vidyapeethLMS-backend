import mongoose from "mongoose";


const resultSchema = mongoose.Schema({
    student : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "user",
        required : true,
    },
    subject : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "subject",
        required : true,
    },
    testId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "test",
        required : true,
    },
    totalAttempted : {
        type : Number,
        required : true
    },
    TotalScore : {
        type : Number,
        default : 0
    },
    answers : [
        {
            question : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "question",
                required : true
            },
            selectedOptionIndex : Number,
            writtenAnswer : String,
            isCorrect : Boolean,
            marksObtained : Number
        }
    ],
    status : {
        type : String,
        enum : ["submitted","auto_submitted"],
        default : "auto_submitted",
        
    }

},{
    timestamps : true
})

export const resultModel = mongoose.model("result",resultSchema);