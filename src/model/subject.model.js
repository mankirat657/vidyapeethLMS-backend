import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        minlength : [3, "subject should be atleast 3 characters long"],
        maxlength : [50,"subject cannot exceeds 30 characters"],
        unique :true
    },
    description : {
        type : String,
    },
    subjectCode : {
        type : String,
    },
    modules : {
        type : String,
    },
    lesson : {
        type : String,
    },
    admin : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true,
    }
})
export const subjectModel = mongoose.model("subject", subjectSchema);
