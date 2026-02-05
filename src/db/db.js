import mongoose from "mongoose";


export const connectDb = async() => {
    await mongoose.connect(process.env.MONGODB_URI)
    .then(()  => {
        console.log("Successfully connected to db")
    }).catch((error) => {
        console.log(`error occurred : ${error}`)
    })
}