import { v4 } from "uuid";
import { contentModel } from "../model/knowledgeBankContent.model.js";
import { subjectModel } from "../model/subject.model.js";
import { generateQuestionAnswers } from "../service/ai.service.js";
import { uploadFile } from "../service/storage.service.js";
import { userModel } from "../model/auth.model.js";
import { resultModel } from "../model/result.model.js";
export const getSubject = async (req, res) => {
  try {
    const subjects = await subjectModel.find().populate("admin");
    console.log(subjects);

    return res.status(200).json({
      message: "subjects fetched successfully",
      subjects
    })
  } catch (error) {
    console.log(error);

    return res.status(403).json({
      message: `error occured ${error}`
    })
  }
}
export const createSubject = async (req, res) => {
  try {
    const { name, description, subjectCode, modules, lesson } = req.body;
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied"
      })
    }
    if (!name || !description) {
      return res.status(400).json({
        message: "At least One field is required"
      })
    }
    const subjectExist = await subjectModel.findOne({ name });
    if (subjectExist) {
      return res.status(400).json({
        message: "subject already exist"
      })
    }

    const subject = await subjectModel.create({
      name,
      description,
      subjectCode,
      modules,
      lesson,
      admin: req.user._id
    })
    return res.status(201).json({
      message: "subject created successfully",
      subject
    })

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: `error occurred : ${error}`
    })
  }
}
export const updateSubject = async (req, res) => {
  try {
    const { id: subjectId } = req.params;
    const { name, description, subjectCode, modules, lesson } = req.body;
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied"
      })
    }
    if (!name && !description && !subjectCode && !modules && !lesson) {
      return res.status(400).json({
        message: "At least one field is required to update"
      });
    }

    if (!subjectId) {
      return res.status(400).json({
        message: "subjectId is needed"
      })
    }
    const existSubjectOrNot = await subjectModel.findOne({ _id: subjectId });
    if (!existSubjectOrNot) return res.json({ message: "no subject is associated with this id" })
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (subjectCode !== undefined) updateData.subjectCode = subjectCode;
    if (modules !== undefined) updateData.modules = modules;
    if (lesson !== undefined) updateData.lesson = lesson;

    updateData.admin = req.user._id;

    const subject = await subjectModel.findByIdAndUpdate(
      subjectId,
      updateData,
      { new: true }
    );

    return res.status(201).json({
      message: "subject successfully updated",
      subject,
    })
  } catch (error) {
    return res.status(500).json({
      message: `error occured : ${error}`
    })
  }
}
export const deleteSubject = async (req, res) => {
  try {
    const { id: subjectId } = req.params;
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied"
      })
    }
    if (!subjectId) {
      return res.status(400).json({
        message: "pls provide the subject ID"
      })
    }
    const existingSubject = await subjectModel.findOne({ _id: subjectId });
    if (!existingSubject) return res.status(400).json({ message: "subject not found" })
    const subject = await subjectModel.findByIdAndDelete({ _id: subjectId });
    return res.status(200).json({
      message: "subject deleted successfully"
    })
  } catch (error) {
    return res.status(500).json({
      message: `error occured : ${error}`
    })
  }
}
export const getQuestionAnswers = async (req, res) => {
  try {
    const { id: subjectId } = req.params;
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: " Access Denied"
      })
    }
    if (!subjectId) {
      return res.status(400).json({
        message: "SubjectId not provided"
      })
    }
    const questionAnswers = await contentModel.find({
      subject: subjectId
    });

    return res.status(200).json({
      message: "questionAnswer fetched successfully",
      questionAnswers
    })
  } catch (error) {
    return res.status(500).json({
      message: `error occured : ${error}`
    })
  }
}
export const createQuestionAnswers = async (req, res) => {
  try {
    const { id: subjectId } = req.params;
    const file = req.file;
    let { questions, prompt } = req.body;
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied"
      })
    }
    if (!subjectId) {
      return res.status(400).json({
        message: "subjectId not provided"
      });
    }

    if (!questions && !prompt && !file) {
      return res.status(400).json({
        message: "questions or prompt or pdf is required"
      });
    }

    if (questions && !Array.isArray(questions)) {
      return res.status(400).json({
        message: "questions must be an array"
      });
    }


    if (!prompt && !file && !Array.isArray(questions)) {
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
      });

      return res.status(201).json({
        message: "AI-generated questions saved",
        questionAnswer
      });
    }
    if (file && !questions) {
      const questionAnswer = await contentModel.create({
        subject: subjectId,
        admin: req.user._id,
        pdf: pdfUrl,
      });

      return res.status(201).json({
        message: "PDF uploaded successfully",
        questionAnswer
      });
    }

    const questionAnswer = await contentModel.create({
      subject: subjectId,
      admin: req.user._id,
      questions,
      pdf: pdfUrl,
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
    if (req.user.role !== "admin") {
      return res.status(400).json({
        message: "only admin can update Question Answers "
      })
    }
    const {
      updatedQuestion,
      questionType,
      weightage,
      updatedAnswer
    } = req.body;
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied"
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
import mongoose from "mongoose";

export const deleteQuestionAnswer = async (req, res) => {
  const { id: subjectId, quesid: questionId } = req.params;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied" });
  }

  try {
    const updatedDoc = await contentModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(subjectId) }, 
      {
        $pull: {
          questions: {
            _id: new mongoose.Types.ObjectId(questionId)
          }
        }
      },
      { new: true }
    );


    if (!updatedDoc) {
      return res.status(404).json({
        message: "Content not found"
      });
    }

    // 🔥 Step 2: Check if questions array is empty
    if (updatedDoc.questions.length === 0) {
      await contentModel.deleteOne({ _id: updatedDoc._id });

      return res.status(200).json({
        message: "Last question deleted → entire content removed"
      });
    }

    // Normal case
    return res.status(200).json({
      message: "Question deleted successfully",
      updatedDoc
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `error occurred ${error.message}`
    });
  }
};
export const deleteContent = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied" });
  }

  try {
    const result = await contentModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Content not found"
      });
    }

    return res.status(200).json({
      message: "Content deleted successfully"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `error occurred ${error.message}`
    });
  }
};
export const getStudents = async(req,res) => {
  try {
    if(req.user.role !== "admin"){
      return res.status(400).json({
        message : "only admin can get students data"
      })
    }
    const students = await userModel.find({role : "user"});
    return res.status(200).json({
      message : "students successfully fetched",
      students
    })
  } catch (error) {
    return res.status(500).json({
      message : `error occured ${error}`
    })
  }
}
export const blockStudent = async (req, res) => {
  try {
    const { stuId } = req.params;
    if (req.user.role !== "admin") {
      return res.status(400).json({
        message: "only admin can block student"
      })
    }
    const isStudentExist = await userModel.findOne({
      _id: stuId
    })
    if (!isStudentExist) {
      return res.status(400).json({
        message: "student not exist"
      })
    }
    await userModel.findByIdAndUpdate(stuId, {
      isBlocked: true
    }, { new: true })
    return res.status(200).json({
      message: "student is now blocked"
    })
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: `error occured : ${error}`
    })
  }
}
export const unblockStudent = async (req, res) => {
  try {
    const { stuId } = req.params;
    if (req.user.role !== "admin") {
      return res.status(400).json({
        message: "only admin can unblock student"
      })
    }
    const isStudentExist = await userModel.findOne({ _id: stuId });
    if (!isStudentExist) {
      return res.status(400).json({
        message: "student dont exist in database"
      })
    }
    const ifUserBlocked = await userModel.findOne({ _id: stuId, "isBlocked": { $exists: true } });
    if (!ifUserBlocked.isBlocked) {
      return res.status(400).json({
        message: "user is not blocked"
      })
    }
    await userModel.findByIdAndUpdate(stuId, { isBlocked: false }, { new: true });

    return res.status(200).json({
      message: "student sucessfully unblocked"
    })
  } catch (error) {
    return res.status(500).json({
      message: `error occured : ${error}`
    })
  }
}

export const viewStudentResult = async (req, res) => {
  try {
    const { stuId, subId } = req.params;
    const isUserExist = await userModel.findOne({ _id: stuId });
    if (!isUserExist) {
      return res.status(400).json({
        message: "student not found in the database"
      })
    }
    const isStudentGivenTest = await resultModel.findOne({
      student: stuId,
      subject: subId
    }).populate('subject').populate("student")
    if (!isStudentGivenTest) {
      return res.status(400).json({
        message: "student has not given this test"
      })
    }
    return res.status(200).json({
      message: "result fetched successfully",
      isStudentGivenTest
    })
  } catch (error) {
    return res.status(500).json({
      message: `error occured ${error}`
    })
  }
}