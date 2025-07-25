import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

export const isAuthenticated = async (req, res, next) => {
  try {
    // Check for token in cookies first, then in Authorization header
    let token = req.cookies?.token;

    // If no token in cookies, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    // If still no token found
    if (!token) {
      return res.status(401).json({
        message: "No authentication token provided. Please login!",
        success: false,
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET);

    if (!decoded) {
      return res.status(401).json({
        message: "Invalid token. Please login again!",
        success: false,
      });
    }

    // Get user to access role information
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: "User not found. Please login again!",
        success: false,
      });
    }

    req.userId = decoded.id;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.log("Error inside of auth middleware:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token. Please login again!",
        success: false,
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired. Please login again!",
        success: false,
      });
    }

    return res.status(500).json({
      message: "Authentication error. Please try again!",
      success: false,
    });
  }
};
