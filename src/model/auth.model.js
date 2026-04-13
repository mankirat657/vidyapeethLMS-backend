import mongoose from "mongoose";

const authSchema = new mongoose.Schema({
  fullName: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30
    },
    lastName: {
      type: String,
      trim: true,
    }
  },
  picture: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  course : String,
  password: {
    type: String,
    minlength: 8,
    select: false,
    required: function () {
      return this.authProvider === "local";
    },
    validate: {
      validator: function (value) {
        if (this.authProvider !== "local") return true;
        return /(?=.*[0-9])(?=.*[!@#$%^&*])/.test(value);
      },
      message:
        "Password must contain at least 1 number and 1 special character"
    }
  },

  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  isBlocked : {
    type : Boolean,
    default : false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isVerified: {
    type: Boolean,
    default: function () {
      return this.authProvider === "google";
    }
  }

}, { timestamps: true });

export const userModel = mongoose.model("user", authSchema);