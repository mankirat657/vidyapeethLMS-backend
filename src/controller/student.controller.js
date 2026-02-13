import { userModel } from "../model/auth.model.js";
import { contentModel } from "../model/knowledgeBankContent.model.js";
import { resultModel } from "../model/result.model.js";

export const getResult = async(req,res) =>{
    try {
        const {stuId,subId} = req.params;
        const isUserExist = await userModel.findOne({_id : stuId});
        if(!isUserExist){
          return res.status(400).json({
            message : "student not found in the database"
          })
        }
        const isStudentGivenTest = await resultModel.findOne({
          student : stuId,
          subject : subId
        }).populate('subject').populate("student")
        if(!isStudentGivenTest){
          return res.status(400).json({
            message : "student has not given this test"
          })
        }
        return res.status(200).json({
          message : "result fetched successfully",
          isStudentGivenTest
        })
      } catch (error) {
        return res.status(500).json({
          message : `error occured ${error}`
        })
      }
}

export const getMaterial = async(req,res)=>{
    try {
        const {subId} = req.params;
        const knowledegeBankExist = await contentModel.find({
            subject : subId
        }).populate('subject')
        if(!knowledegeBankExist){
            return res.status(400).json({
                message : "knowledge bank doesnot exist"
            })
        }
        return res.status(200).json({
            message : "bank retrieved successfully",
            knowledegeBankExist
        })
    } catch (error) {
        return res.status(500).json({
            message : `error occured ${error}`
        })
    }
}