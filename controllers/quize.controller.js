import Quize from "../models/Quize.model.js";
export const createQuizeController = async (req, res) => {
  const { title, questions } = req.body;
  const userId = req.userId; // From authentication middleware

  try {
    if (
      !title ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Title and questions are required" });
    }

    for (const q of questions) {
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctAnswer !== "number" ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
      ) {
        return res.status(400).json({ message: "Invalid question format" });
      }
    }

    const newQuiz = new Quize({
      title,
      questions,
      createdBy: userId,
    });
    await newQuiz.save();
    return res
      .status(201)
      .json({ message: "Quiz created successfully", quiz: newQuiz });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const deleteQuizeController = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;

  try {
    if (!id) {
      return res.status(404).json({
        message: "Quiz doesn't exist!",
        success: false,
      });
    }

    const quize = await Quize.findById(id);
    if (!quize) {
      return res.status(404).json({
        message: "Quiz doesn't exist!",
        success: false,
      });
    }

    // Check if user is admin or the creator of the quiz
    if (userRole !== "admin" && quize.createdBy.toString() !== userId) {
      return res.status(403).json({
        message: "You don't have permission to delete this quiz",
        success: false,
      });
    }

    await Quize.findByIdAndDelete(id);
    res.status(200).json({
      message: "Quiz deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error deleting the quize: ", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updateQuizeController = async (req, res) => {
  const { id } = req.params;
  const { title, questions } = req.body;
  const userId = req.userId;
  const userRole = req.userRole;

  try {
    if (!id) {
      return res.status(400).json({
        message: "Something went wrong!",
        success: false,
      });
    }

    // Check if quiz exists and get creator info
    const existingQuiz = await Quize.findById(id);
    if (!existingQuiz) {
      return res.status(404).json({
        message: "Quiz not found",
        success: false,
      });
    }

    // Check if user is admin or the creator of the quiz
    if (userRole !== "admin" && existingQuiz.createdBy.toString() !== userId) {
      return res.status(403).json({
        message: "You don't have permission to edit this quiz",
        success: false,
      });
    }

    if (
      !title ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Title and questions are required" });
    }

    for (const q of questions) {
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctAnswer !== "number" ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
      ) {
        return res.status(400).json({ message: "Invalid question format" });
      }
    }

    const updatedQuiz = await Quize.findByIdAndUpdate(
      id,
      { title, questions },
      { new: true }
    );

    return res.status(200).json({
      message: "Quiz updated successfully",
      success: true,
      quiz: updatedQuiz,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getAllQuizesController = async (req, res) => {
  try {
    const quizes = await Quize.find().populate("createdBy", "name email");
    return res.status(200).json({
      message: "Quizes fetched successfully",
      success: true,
      quizes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getQuizeByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const quize = await Quize.findById(id).populate("createdBy", "name email");
    if (!quize) {
      return res.status(404).json({
        message: "Quiz not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Quiz fetched successfully",
      success: true,
      quize,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get user's own quizzes
export const getUserQuizesController = async (req, res) => {
  const userId = req.userId;

  try {
    const quizes = await Quize.find({ createdBy: userId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "User quizes fetched successfully",
      success: true,
      quizes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
