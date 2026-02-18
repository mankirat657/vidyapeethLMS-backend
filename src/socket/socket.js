import { AiChatBot } from "../service/ai.service.js";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { userModel } from "../model/auth.model.js";
export  function setUpDoubtAi(io){
io.use(async (socket,next) =>{
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "")
    if(!cookies.token){
        next(new Error("Authentication Error : Token not provided"))
    }
    try {
        const decoded = jwt.verify(cookies.token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        socket.user = user;
        next();
    } catch (error) {
        next(new Error("Authentication Error : Invalid token"))
    }
})
io.on("connection",(socket)=>{
    console.log("This is socket id",socket.id);
    socket.on("send-message",async(data)=>{
        console.log(data);
        const response = await AiChatBot(data.message);
        console.log(response);

        socket.emit("ai-response",response);

    })
})  
}