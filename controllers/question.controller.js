// const Question = require("../models/question.model");

// const postQuestion = async (req, res) => {
//   try {
//     const { title, description, tags, attachments } = req.body;

//     // Validate required fields
//     if (!title || !description) {
//       return res.status(400).json({ message: "Title and description are required." });
//     }

//     // Ensure only logged-in users can post
//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized. Please log in." });
//     }

//     // Create new question
//     const newQuestion = new Question({
//       title,
//       description,
//       author: req.user._id, // Assuming req.user is populated from authentication middleware
//       tags: tags || [],
//       attachments: attachments || [],
//     });

//     // Save to database
//     await newQuestion.save();

//     res.status(201).json({
//       message: "Question posted successfully.",
//       question: newQuestion,
//     });
//   } catch (error) {
//     console.error("Error posting question:", error);
//     res.status(500).json({ message: "Internal Server Error." });
//   }
// };

// module.exports = { postQuestion };
