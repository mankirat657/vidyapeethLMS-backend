import express from "express";
import { googleAuthLogin } from "../controller/googleauth.controller.js";
import passport from "passport";

const router = express.Router();

router.get("/auth/google",passport.authenticate('google',{scope: ['profile','email']}))
router.get("/auth/google/callback",passport.authenticate('google',{session : false}), googleAuthLogin)

export default router;