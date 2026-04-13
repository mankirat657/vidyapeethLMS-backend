
import jwt from 'jsonwebtoken'
import { userModel } from '../model/auth.model.js';

export const googleAuthLogin = async (req, res) => {
  try {
    const profile = req.user;

    const email = profile.emails[0].value;
    const firstName = profile.name.givenName;
    const lastName = profile.name.familyName;
    const picture = profile.photos[0].value;
    const verified = profile.emails[0].verified;
    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        fullName: {
          firstName,
          lastName
        },
        picture,
        email,
        authProvider: "google",
        isVerified: verified
      });
    }
    const token = jwt.sign(
      { user: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    return res.redirect("http://localhost:5173/auth-success");

  } catch (error) {
    return res.status(500).json({
      message: `error occured while login ${error}`
    });
  }
};
