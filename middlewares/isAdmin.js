import User from "../models/user.model.js";

export const isAdmin = async (req, res, next) => {
  try {
    const id = req.userId;
    console.log("Id inside of isAdmin:", id);
    if (!id) {
      return res.status(404).json({
        message: "Please login!",
        success: false,
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "Please login!",
        success: false,
      });
    }
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to access this resource",
        success: false,
      });
    }
    next();
  } catch (error) {
    console.log("error inside of isadmin: ", error.message);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
      success: false,
    });
  }
};
