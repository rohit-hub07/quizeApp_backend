import express from "express";
import {
  forgetPasswordController,
  loginController,
  logoutController,
  profileController,
  registerUserController,
  resetPasswordController,
  verificationController,
  resendVerificationController,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.middle.js";

const authRouter = express.Router();

authRouter.post("/register", registerUserController);
authRouter.get("/verify/:token", verificationController);
authRouter.post("/login", loginController);
authRouter.get("/logout", isAuthenticated, logoutController);
authRouter.get("/profile", isAuthenticated, profileController);
authRouter.post("/forget-password", forgetPasswordController);
authRouter.post("/reset-password/:token", resetPasswordController);
authRouter.post(
  "/resend-verification",
  isAuthenticated,
  resendVerificationController
);
authRouter.put("/reset-password/:token", resetPasswordController);

export default authRouter;
