import User from "../models/user.model.js";

export const isEmailVerified = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Please login first",
        success: false,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Please verify your email address before creating or participating in quizzes",
        success: false,
        requiresVerification: true,
      });
    }

    next();
  } catch (error) {
    console.error("Email verification check error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
