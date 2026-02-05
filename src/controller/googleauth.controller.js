
import jwt from 'jsonwebtoken'
import { userModel } from '../model/auth.model.js';
export const googleAuthLogin = async (req, res) => {
    /*collecting the neccessary information */
    try {
    const profile = req.user;
    const email = profile.emails[0].value;
    const firstName = profile.name.givenName;
    const lastName = profile.name.familyName;
    const picture = profile.photos[0].value;
    const verified = profile.emails[0].verified;
    /*checking if existing user is there in db */

    const user = await userModel.findOne({ email })
    if (!user) {
        const newUser = await userModel.create({
            fullName: {
                firstName: firstName,
                lastName: lastName
            },
            picture: picture,
            email: email,
            authProvider: "google",
            isVerified: verified
        })
        const token = jwt.sign({ id: newUser._id}, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token",token)
        res.status(200).json({
            message : "Login successfull"
        })
        console.log(req.user)
    }
    } catch (error) {
        return res.status(500).json({
            message : `error occured while login ${error}`
        })
    }
    


}