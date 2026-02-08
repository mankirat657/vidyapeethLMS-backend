import { v4 } from "uuid";
import { contentModel } from "../model/knowledgeBankContent.model.js";
import { subjectModel } from "../model/subject.model.js";
import { generateQuestionAnswers } from "../service/ai.service.js";
import { uploadFile } from "../service/storage.service.js";

export const createSubject = async(req,res) =>{
    try {
        const {name,description} = req.body;
        if(req.user.role !== "admin"){
            return res.status(403).json({
                message : "Access Denied"
            })
        }
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
         if(req.user.role !== "admin"){
            return res.status(403).json({
                message : "Access Denied"
            })
        }
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
        if(req.user.role !== "admin"){
           return res.status(403).json({
               message : "Access Denied"
           })
       }
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

export const createQuestionAnswers = async (req, res) => {
  try {
    const { id: subjectId } = req.params;
    const file = req.file;
    let { questions, subjectWeightage, prompt } = req.body;
 if(req.user.role !== "admin"){
            return res.status(403).json({
                message : "Access Denied"
            })
        }
    if (!subjectId) {
      return res.status(400).json({
        message: "subjectId not provided"
      });
    }

    if (!questions && !prompt) {
      return res.status(400).json({
        message: "questions or prompt is required"
      });
    }

    if (file && typeof questions === "string") {
      try {
        questions = JSON.parse(questions);
      } catch (err) {
        return res.status(400).json({
          message: "Invalid JSON format for questions"
        });
      }
    }

    if (!prompt && !Array.isArray(questions)) {
      return res.status(400).json({
        message: "questions must be an array"
      });
    }

    let pdfUrl = null;

    if (file) {
      const uploadedPdf = await uploadFile(file.buffer, `${v4()}`);
      pdfUrl = uploadedPdf.url;
    }

    if (prompt) {
      const response = await generateQuestionAnswers(prompt);
      const aiData = JSON.parse(response);

      if (!Array.isArray(aiData.questions)) {
        return res.status(400).json({
          message: "Invalid AI response format"
        });
      }

      const questionAnswer = await contentModel.create({
        subject: subjectId,
        admin: req.user._id,
        questions: aiData.questions,
        pdf: pdfUrl,
        subjectWeightage
      });

      return res.status(201).json({
        message: "AI-generated questions saved",
        questionAnswer
      });
    }

    const questionAnswer = await contentModel.create({
      subject: subjectId,
      admin: req.user._id,
      questions,
      pdf: pdfUrl,
      subjectWeightage
    });

    return res.status(201).json({
      message: "Questions created successfully",
      questionAnswer
    });

  } catch (error) {
    return res.status(500).json({
      message: `error occurred ${error.message}`
    });
  }
};

export const updateQuestionAnswer = async (req, res) => {
  try {
    const {
      id: contentId,
      quesId: questionId,
      ansId: answerId
    } = req.params;

    const {
      updatedQuestion,
      questionType,
      weightage,
      updatedAnswer
    } = req.body;
     if(req.user.role !== "admin"){
            return res.status(403).json({
                message : "Access Denied"
            })
        }
    if (!contentId || !questionId) {
      return res.status(400).json({
        message: "contentId or questionId missing"
      });
    }

    let updateQuery = {};
    let options = { new: true };

    if (answerId && updatedAnswer) {
      updateQuery.$set = {
        "questions.$[q].answers.$[a].answerText": updatedAnswer
      };

      options.arrayFilters = [
        { "q._id": questionId },
        { "a._id": answerId }
      ];
    }

    if (updatedQuestion || questionType || weightage !== undefined) {
      updateQuery.$set = {
        ...(updateQuery.$set || {}),
        ...(updatedQuestion && { "questions.$[q].questionText": updatedQuestion }),
        ...(questionType && { "questions.$[q].questionType": questionType }),
        ...(weightage !== undefined && { "questions.$[q].weightage": weightage })
      };

      options.arrayFilters = options.arrayFilters || [{ "q._id": questionId }];
    }

    const updatedData = await contentModel.findOneAndUpdate(
      { _id: contentId },
      updateQuery,
      options
    );

    if (!updatedData) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    return res.status(200).json({
      message: "Question / Answer updated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: `error occurred ${error.message}`
    });
  }
};
export const deleteQuestionAnswer = async (req, res) => {
  const { id: subjectId, quesid: questionId } = req.params;
 if(req.user.role !== "admin"){
            return res.status(403).json({
                message : "Access Denied"
            })
        }
  if (!subjectId || !questionId) {
    return res.status(400).json({
      message: "subject id or question id not found"
    });
  }

  try {
    const updatedDoc = await contentModel.findOneAndUpdate(
      { subject: subjectId },
      {
        $pull: {
          questions: { _id: questionId }
        }
      },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({
        message: "content not found"
      });
    }

    return res.status(200).json({
      message: "question deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: `error occurred ${error.message}`
    });
  }
};
