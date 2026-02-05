import { transporter } from "../config/mailer.js";

export const sendVerificationEmail = async(email,token) =>{
    const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`

    await transporter.sendMail({
        from : `"Vidyapeeth LMS" <${process.env.EMAIL_USER}>`,
        to : email,
        subject : "verify your email",
        html : `
            <h2>Email verification</h2>
            <p>Click the link below:</p>
            <a href="${link}">Verify Email</a>
        `
    })
}