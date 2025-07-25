import User from "../models/user.model.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

export const registerUserController = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required!",
        success: false,
      });
    }
    //check if the user already exists!
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }
    const newUser = await User.create({
      name,
      email,
      password,
      role,
    });
    if (!newUser) {
      return res.status(500).json({
        message: "Something went wrong!",
        success: false,
      });
    }
    const token = crypto.randomBytes(32).toString("hex");
    newUser.verificationToken = token;
    await newUser.save();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("SMTP: ", process.env.SMTP_USER);
    const mailOptions = {
      from: `Quize App ${process.env.SMTP_SENDER}`,
      to: newUser.email,
      subject: "Verify Your Email",
      html: `<h2>Welcome to QuizeWeb, ${newUser.name}!</h2>
             <p>Please click the link below to verify your email:</p>
             <a href="${process.env.FRONTEND_URL}/auth/verify/${token}" style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
             <p>This link will expire in 24 hours.</p>
             <p>If you didn't request this verification, please ignore this email.</p>`,
    };
    await transporter.sendMail(mailOptions);
    res.status(201).json({
      message: "Check your email for verification!",
      success: true,
      newUser,
    });
  } catch (error) {
    console.log("Error registering the user: ", error);
    return res.status(500).json({
      message: "Something went wrong!",
      success: false,
    });
  }
};

export const verificationController = async (req, res) => {
  const { token } = req.params;
  try {
    if (!token) {
      return res.status(404).json({
        message: "Token expired!",
        success: false,
      });
    }
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({
        message: "Invalid link!",
        success: false,
      });
    }
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    const tkn = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.SECRET,
      { expiresIn: "24h" }
    );
    res.cookie("token", tkn, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // false in dev
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      domain: "quizeapp-backend-3ma3.onrender.com",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User verified successfully!",
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error verifying the user: ", error);
    return res.status(500).json({
      message: "Something went wrong!",
      success: false,
    });
  }
};

export const loginController = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required!",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "No account found with the provided email!",
        success: false,
      });
    }
    const isMatched = await bcrypt.compare(password, user.password);
    console.log("ismatched value: ", isMatched);
    if (!isMatched) {
      return res.status(401).json({
        message: "Email or password is incorrect!",
        success: false,
      });
    }
    const tkn = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.SECRET,
      { expiresIn: "24h" }
    );
    res.cookie("token", tkn, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // false in dev
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      domain: "quizeapp-backend-3ma3.onrender.com",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Logged in successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error logging the user: ", error);
    return res.status(500).json({
      message: "Something went wrong!",
      success: false,
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      domain: "quizeapp-backend-3ma3.onrender.com",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "User logged out successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error loggin out the user: ", error);
    return res.status(500).json({
      message: "Something went wrong!",
      success: false,
    });
  }
};

export const profileController = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(404).json({
        message: "Please login!",
        success: false,
      });
    }
    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({
        message: "Please login!",
        success: false,
      });
    }
    res.status(200).json({
      message: "User profile fetched successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error fetching the user profile!", error);
    return res.status(500).json({
      message: "Something went wrong!",
      success: false,
    });
  }
};

export const forgetPasswordController = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({
        message: "All fields are required!",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address",
        success: false,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    console.log("user inside of forget pass: ", user);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    // console.log("SMTP: ", process.env.SMTP_USER);
    const mailOptions = {
      from: `Quize App ${process.env.SMTP_SENDER}`,
      to: user.email,
      subject: "Reset Your Password",
      html: `<h2>Password Reset Request</h2>
             <p>Hello ${user.name},</p>
             <p>We received a request to reset your password. Please click the link below to reset your password:</p>
             <a href="${process.env.FRONTEND_URL}/reset-password/${token}" style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
             <p>This link will expire in 10 minutes.</p>
             <p>If you didn't request this password reset, please ignore this email.</p>`,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: "Check your email to reset password!",
      success: true,
    });
  } catch (error) {
    console.log("Error inside of forgot pass controller: ", error);
    return res.status(500).json({
      message: "Something went wrong!",
      success: false,
    });
  }
};

export const resetPasswordController = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  try {
    if (!password) {
      return res.status(400).json({
        message: "All fields are required!",
        success: false,
      });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(404).json({
        message: "Token expired! Try again",
        success: false,
      });
    }
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    res.status(200).json({
      message: "Password reset successful",
      success: true,
    });
  } catch (error) {
    console.log("Error reseting the password: ", error);
    return res.status(500).json({
      message: "Something went wrong!",
      success: false,
    });
  }
};

export const resendVerificationController = async (req, res) => {
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

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
        success: false,
      });
    }

    // Generate new verification token
    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    await user.save();

    // Send verification email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `Quize App ${process.env.SMTP_SENDER}`,
      to: user.email,
      subject: "Verify Your Email - Quiz App",
      html: `<h2>Welcome to QuizeWeb, ${user.name}!</h2>
             <p>Please click the link below to verify your email:</p>
             <a href="${process.env.FRONTEND_URL}/auth/verify/${token}" style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
             <p>This link will expire in 24 hours.</p>
             <p>If you didn't request this verification, please ignore this email.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Verification email sent successfully! Please check your email.",
      success: true,
    });
  } catch (error) {
    console.log("Error resending verification email: ", error);
    return res.status(500).json({
      message: "Failed to send verification email. Please try again later.",
      success: false,
    });
  }
};
