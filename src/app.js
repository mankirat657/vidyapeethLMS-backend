import express from "express";
import passport from "passport";
import googleAuthRoutes from './routes/googleauth.routes.js'
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import studentRoutes from './routes/student.routes.js'
import { Strategy  } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors"
const app = express();

/*express validator */
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}))
/*passport Middleware*/

app.use(passport.initialize())
passport.use(new Strategy({
    clientID : process.env.GOOGLE_CLIENT_ID,
    clientSecret : process.env.GOOGLE_CLIENT_SECRET,
    callbackURL : 'http://localhost:3000/api/auth/google/callback'
}, (accessToken,refreshToken,profile,done) => {
    return done(null,profile)
}
))

/*routes */
app.use('/api',googleAuthRoutes);
app.use('/api',authRoutes)
app.use('/api',adminRoutes)
app.use('/api',studentRoutes)

export default app;