import { AiChatBot } from "../service/ai.service.js";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { userModel } from "../model/auth.model.js";
export function setUpDoubtAi(io) {
    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "")
        if (!cookies.token) {
            return next(new Error("Authentication Error : Token not provided"))
        }
        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            console.log("decioded",decoded);
            
            const user = await userModel.findById(decoded.user);
            if (!user) {
                return next(new Error("Authentication Error: User not found"));
            }

            socket.user = user;
            next();
        } catch (error) {
            return next(new Error("Authentication Error : Invalid token"))
        }
    })
    io.on("connection", (socket) => {
        console.log("This is socket id", socket.id);
        socket.on("send-message", async (data) => {
            const response = await AiChatBot(data.message);
            socket.emit("ai-response", response);
        });
        socket.on("join-student-room", () => {
            socket.join("students");
            console.log(`${socket.id} joined students room`);
        });
        socket.on("disconnect", () => {
            console.log("disconnected", socket.id);

        })

    })
}