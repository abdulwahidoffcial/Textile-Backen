// const mongoose = require("mongoose");

// const questionSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 200, // Limit title length
//     },
//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     author: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // Reference to the User model
//       required: true,
//     },
//     tags: {
//       type: [String], // Array of tags for categorization
//       default: [],
//     },
//     attachments: {
//       type: [
//         {
//           type: String,
//           validate: {
//             validator: function (url) {
//               return /\.(jpg|jpeg|png|svg|gif|webp|pdf|txt|js|py|java|cpp|c|cs|rb|php|html|css|ts)$/.test(
//                 url
//               ); // Validate file types
//             },
//             message: "Invalid file type uploaded.",
//           },
//         },
//       ],
//       default: [],
//     },
//     upvotes: {
//       type: Number,
//       default: 0,
//     },
//     downvotes: {
//       type: Number,
//       default: 0,
//     },
//     views: {
//       type: Number,
//       default: 0,
//     },
//     answers: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Answer", // Reference to the Answer model
//       },
//     ],
//     isApproved: {
//       type: Boolean,
//       default: false, // Moderation flag
//     },
//   },
//   { timestamps: true } // Automatically adds createdAt and updatedAt fields
// );

// const Question = mongoose.model("Question", questionSchema);

// module.exports = Question;
