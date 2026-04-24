import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import app from "./src/app.js";
import { connectDb } from "./src/db/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { setUpDoubtAi } from "./src/socket/socket.js";
const httpServer = createServer(app);

export const io = new Server(httpServer, { /* options */ });
/*student ask doubt with ai */
setUpDoubtAi(io);
connectDb()
httpServer.listen(process.env.PORT,()=>{
    console.log(`server successfully started at port ${process.env.PORT}`)
})