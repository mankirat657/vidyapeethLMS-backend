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
        refer : "subject",
        required : true,
        index : true
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