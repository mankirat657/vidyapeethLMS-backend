import { contentModel } from "../model/knowledgeBankContent.model.js";
import { subjectModel } from "../model/subject.model.js";
import { generateQuestionAnswers } from "../service/ai.service.js";

export const createSubject = async(req,res) =>{
    try {
        const {name,description} = req.body;
        if(!name || !description){
            return res.status(400).json({
                message : "name or description is required"
            })
        }
        const subjectExist = await subjectModel.findOne({name});
        if(subjectExist){
            return res.status(400).json({
                message : "subject already exist"
            })
        }
        
        const subject = await subjectModel.create({
            name,
            description,
            admin : req.user._id
        })
        return res.status(201).json({
            message : "subject created successfully",
            subject
        })

    } catch (error) {
        return res.status(500).json({
            message : `error occurred : ${error}`
        })
    }
}
export const updateSubject = async(req,res) => {
    try {
        const {id : subjectId} = req.params;
        const{name,description} = req.body;
        if(!name && !description){
            return res.status(400).json({
                message : "one property is need to update cannot left empty"
            })
        }
        if(!subjectId){
            return res.status(400).json({
                message : "subjectId is needed"
            })
        }
        const existSubjectOrNot = await subjectModel.findOne({_id : subjectId});
        if(!existSubjectOrNot) return res.json({message : "no subject is associated with this id"})
        const subject = await subjectModel.findByIdAndUpdate({_id : subjectId},{
            name : name,
            description : description,
            admin : req.user._id
        })
        return res.status(201).json({
            message : "subject successfully updated",
            subject,
            

        })
    } catch (error) {
            return res.status(500).json({
                message : `error occured : ${error}`
            })  
    }
}
export const deleteSubject = async(req,res)=>{
    try {
        const{id : subjectId} = req.params;
        if(!subjectId){
            return res.status(400).json({
                message : "pls provide the subject ID"
            })
        }
        const existingSubject = await subjectModel.findOne({_id : subjectId});
        if(!existingSubject) return res.status(400).json({message:"subject not found"})
        const subject = await subjectModel.findByIdAndDelete({_id: subjectId});
        return res.status(200).json({
            message : "subject deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message : `error occured : ${error}`
        })
    }
}

export const createQuestionAnswers = async(req,res)=>{
    try {
        const {id: subjectId} = req.params;
        const {questions,pdf,subjectWeightage,prompt} = req.body;
        if(!questions && !prompt ){
            return res.status(400).json({
                message : "questionText and answerText is needed"
            })
        }
        if(!subjectId){
            return res.status(400).json({
                message : "subjectId not provided"
            })
        }
        if(!prompt){

            const questionAnswer = await contentModel.create({
                subject : subjectId,
                admin : req.user._id,
                questions : questions,
                pdf : pdf,
                subjectWeightage : subjectWeightage
            })
             return res.status(201).json({
            message : "question answers created successfully",
            questionAnswer
        })
        }
        const response = await generateQuestionAnswers(prompt);
        console.log(response);
        let aiData = JSON.parse(response);
        if (!aiData.questions || !Array.isArray(aiData.questions)) {

            return res.status(400).json({
                message : "Invalid ai response format"
            })
        }
        const questionAnswer  = await contentModel.create({
            subject : subjectId,
            admin : req.user._id,
            questions : aiData.questions,
            pdf : pdf,
            subjectWeightage : subjectWeightage
        })
       return res.status(200).json({
        message : "successfully generated QuestionsAnswer",
        questionAnswer
       })

    } catch (error) {
        return res.status(500).json({
            message : `error occured ${error}`
        })
    }
}   