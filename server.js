import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import app from "./src/app.js";
import { connectDb } from "./src/db/db.js";

connectDb()
app.listen(process.env.PORT,()=>{
    console.log(`server successfully started at port ${process.env.PORT}`)
})