import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.SECRET);

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
    console.log("error inside of auth middleware: ", error);
    return res.status(401).json({
      message: "Please login first!",
      success: false,
    });
  }
};
