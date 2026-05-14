import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "test",
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    submitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

testAttemptSchema.index({ student: 1, test: 1 }, { unique: true });

export const testAttemptModel = mongoose.model(
  "testAttempt",
  testAttemptSchema
);