import { transporter } from "../config/mailer.js";
import "dotenv/config"
export const sendVerificationEmail = async(email,token) =>{
    const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`

    await transporter.sendMail({
        from : `"Vidyapeeth LMS" <${process.env.EMAIL_USER}>`,
        to : email,
        subject : "Verify Your Email - Vidyapeeth LMS",
        html : `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #4f46e5; color: white; text-align: center; padding: 30px 20px;">
                <h1 style="margin: 0; font-size: 24px;">Vidyapeeth LMS</h1>
            </div>
            <div style="padding: 30px 20px; text-align: center;">
                <h2 style="color: #111827;">Verify Your Email</h2>
                <p style="color: #4b5563; font-size: 16px;">
                    Thank you for signing up! Click the button below to verify your email and activate your account.
                </p>
                <a href="${link}" 
                    style="
                        display: inline-block;
                        padding: 15px 25px;
                        margin: 20px 0;
                        font-size: 16px;
                        color: white;
                        background-color: #4f46e5;
                        text-decoration: none;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        transition: all 0.3s ease;
                    "
                    onmouseover="this.style.backgroundColor='#4338ca'"
                >
                    Verify Email
                </a>
                <p style="color: #9ca3af; font-size: 14px;">
                    If you did not sign up, you can safely ignore this email.
                </p>
            </div>
            <div style="background-color: #f3f4f6; text-align: center; padding: 15px 20px; font-size: 12px; color: #6b7280;">
                © 2026 Vidyapeeth LMS. All rights reserved.
            </div>
        </div>
    </div>
    `
    })
}