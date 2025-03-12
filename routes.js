const express = require("express");
const { signup, verifyOTP, login, resendOTP, forgotPassword , newPassword} = require("./controllers/user.controller");
const authMiddleware = require("./auth.middleware");
const { movetoDrive } = require("./controllers/Dashboard.controller");

const router = express.Router();

router.post("/api/register", signup);
router.post("/api/verify-otp", verifyOTP);
router.post("/api/login", login);
router.post("/api/resend-otp", resendOTP);
router.post("/api/forgot-password", forgotPassword);
router.post("/api/new-password", newPassword);
// router.post("/api/post-question", authMiddleware, postQuestion);
router.post("/api/file-moving",authMiddleware,movetoDrive)

module.exports = router;
