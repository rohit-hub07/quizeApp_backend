import mongoose from "mongoose";
import express from "express";
import {
  submitQuizAnswers,
  getUserQuizHistory,
  getUserPerformanceStats,
  getQuizAttemptDetails,
} from "../controllers/result.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.middle.js";
import { isEmailVerified } from "../middlewares/isEmailVerified.middle.js";

const resultRouter = express.Router();

// Submit quiz answers - requires email verification
resultRouter.post(
  "/submit-quiz/:quizId",
  isAuthenticated,
  isEmailVerified,
  submitQuizAnswers
);

// Get user's quiz history with pagination
resultRouter.get("/history", isAuthenticated, getUserQuizHistory);

// Get user's performance statistics
resultRouter.get("/stats", isAuthenticated, getUserPerformanceStats);

// Get detailed results for a specific quiz attempt
resultRouter.get("/attempt/:resultId", isAuthenticated, getQuizAttemptDetails);

export default resultRouter;
