import Quize from "../models/quize.model.js";
import Result from "../models/result.model.js";
import mongoose from "mongoose";

export const submitQuizAnswers = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeTaken } = req.body;
    const userId = req.userId;

    console.log("Submitting quiz:", { quizId, answers, userId, timeTaken });

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({
        message: "quizId and answers are required",
        success: false,
      });
    }

    const quiz = await Quize.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
        success: false,
      });
    }

    const total = quiz.questions.length;
    let score = 0;

    quiz.questions.forEach((q, index) => {
      if (q.correctAnswer === answers[index]) {
        score++;
      }
    });

    const percentage = Math.round((score / total) * 100);

    // Check how many times user has taken this quiz before
    const previousAttempts = await Result.countDocuments({
      user: userId,
      quiz: quizId,
    });
    const attempt = previousAttempts + 1;

    // Save result with enhanced tracking
    const result = new Result({
      user: userId,
      quiz: quizId,
      score,
      total,
      percentage,
      answers,
      timeTaken: timeTaken || null,
      attempt,
    });

    await result.save();

    res.status(200).json({
      message: "Quiz submitted successfully",
      success: true,
      result: {
        score,
        total,
        percentage,
        attempt,
        timeTaken,
        completedAt: result.completedAt,
      },
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

// Get user's quiz history
export const getUserQuizHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const results = await Result.find({ user: userId })
      .populate("quiz", "title createdAt")
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalResults = await Result.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalResults / limit);

    res.status(200).json({
      message: "Quiz history fetched successfully",
      success: true,
      data: {
        results,
        pagination: {
          currentPage: page,
          totalPages,
          totalResults,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

// Get user's performance statistics
export const getUserPerformanceStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Basic stats
    const totalQuizzes = await Result.countDocuments({ user: userId });
    const totalUniqueQuizzes = await Result.distinct("quiz", { user: userId });

    // Average score and percentage
    const avgStats = await Result.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$percentage" },
          totalScore: { $sum: "$score" },
          totalQuestions: { $sum: "$total" },
          bestScore: { $max: "$percentage" },
          worstScore: { $min: "$percentage" },
        },
      },
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Result.countDocuments({
      user: userId,
      completedAt: { $gte: sevenDaysAgo },
    });

    // Quiz performance by category (if you have categories)
    const quizPerformance = await Result.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "quizes",
          localField: "quiz",
          foreignField: "_id",
          as: "quizDetails",
        },
      },
      { $unwind: "$quizDetails" },
      {
        $group: {
          _id: "$quiz",
          quizTitle: { $first: "$quizDetails.title" },
          attempts: { $sum: 1 },
          bestScore: { $max: "$percentage" },
          avgScore: { $avg: "$percentage" },
          lastAttempt: { $max: "$completedAt" },
        },
      },
      { $sort: { lastAttempt: -1 } },
    ]);

    const stats = {
      totalQuizzesTaken: totalQuizzes,
      uniqueQuizzesAttempted: totalUniqueQuizzes.length,
      averageScore: avgStats[0]?.avgScore || 0,
      bestScore: avgStats[0]?.bestScore || 0,
      worstScore: avgStats[0]?.worstScore || 0,
      recentActivity,
      quizPerformance,
    };

    res.status(200).json({
      message: "Performance stats fetched successfully",
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching performance stats:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

// Get detailed results for a specific quiz attempt
export const getQuizAttemptDetails = async (req, res) => {
  try {
    const { resultId } = req.params;
    const userId = req.userId;

    const result = await Result.findOne({
      _id: resultId,
      user: userId,
    }).populate("quiz", "title questions");

    if (!result) {
      return res.status(404).json({
        message: "Quiz result not found",
        success: false,
      });
    }

    // Create detailed analysis
    const detailedAnalysis = result.quiz.questions.map((question, index) => ({
      questionNumber: index + 1,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      userAnswer: result.answers[index],
      isCorrect: question.correctAnswer === result.answers[index],
    }));

    res.status(200).json({
      message: "Quiz attempt details fetched successfully",
      success: true,
      data: {
        result,
        detailedAnalysis,
      },
    });
  } catch (error) {
    console.error("Error fetching quiz attempt details:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};
