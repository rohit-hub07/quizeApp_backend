import mongoose from "mongoose";
import express from "express";
import {
  createQuizeController,
  deleteQuizeController,
  updateQuizeController,
  getAllQuizesController,
  getQuizeByIdController,
  getUserQuizesController,
} from "../controllers/quize.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.middle.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isEmailVerified } from "../middlewares/isEmailVerified.middle.js";

const quizeRouter = express.Router();

// Public routes
quizeRouter.get("/all-quizes", getAllQuizesController);

// Protected routes that require authentication and email verification
quizeRouter.get(
  "/quiz/:id",
  isAuthenticated,
  isEmailVerified,
  getQuizeByIdController
);

// User quiz management - all authenticated users can create/manage their own quizzes
quizeRouter.post(
  "/create-quize",
  isAuthenticated,
  isEmailVerified,
  createQuizeController
);

quizeRouter.get(
  "/my-quizes",
  isAuthenticated,
  isEmailVerified,
  getUserQuizesController
);

// Quiz update/delete - users can edit their own, admins can edit any
quizeRouter.put(
  "/update-quize/:id",
  isAuthenticated,
  isEmailVerified,
  updateQuizeController
);

quizeRouter.delete(
  "/delete-quize/:id",
  isAuthenticated,
  isEmailVerified,
  deleteQuizeController
);

export default quizeRouter;
