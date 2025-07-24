import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quize",
      required: true,
    },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    answers: [{ type: Number }], 
    timeTaken: { type: Number },
    completedAt: { type: Date, default: Date.now },
    attempt: { type: Number, default: 1 },
  },
  {
    timestamps: true, 
  }
);

// Index for better query performance
resultSchema.index({ user: 1, completedAt: -1 });
resultSchema.index({ user: 1, quiz: 1 });

const Result = mongoose.models.Result || mongoose.model("Result", resultSchema);

export default Result;
