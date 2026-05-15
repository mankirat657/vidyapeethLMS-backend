import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
    admin : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true,
        index : true
    },
    subject : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "subject",
        required : true,
        index : true
    },
    isFinished : {
        type : String,
        enum : ["true","false"],
        default : "false"
    },
    isPublished : {
        type : Boolean,
        default : false
    },
    questions : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "question"
    }],
    testDuration : {
        type : Number,
        required : true
    }
},
{
    timestamps : true
})

export const testModel = mongoose.model('test',testSchema);