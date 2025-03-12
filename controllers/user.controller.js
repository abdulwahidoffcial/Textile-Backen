const bcrypt = require("bcryptjs");
const sendEmail = require("../email.service");
const User = require("../models/users.model");
const jwt = require("jsonwebtoken");

// Generate OTP function with expiry
const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 120 * 1000; // Expiry timestamp
    return { otp, expiresAt };
};

// Signup controller
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            if (existingUser.verified) {
                return res.status(400).json({ message: "Email already registered.", verified:true });
            } else {
                // User exists but is not verified → Update details and resend OTP
                const hashedPassword = await bcrypt.hash(password, 10);
                const { otp, expiresAt } = generateOTP();

                existingUser.name = name;
                existingUser.password = hashedPassword;
                existingUser.otp = otp;
                existingUser.otpExpiresAt = expiresAt;

                await existingUser.save();

                // Resend OTP to user's email
                await sendEmail(email, "Verify Your Email", `Your OTP for verification is: ${otp}`);

                return res.status(200).json({ message: "Account found but not verified. Details updated, and a new OTP has been sent.", verified:false });
            }
        }

        // Hash password for new user
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP for email verification
        const { otp, expiresAt } = generateOTP();

        // Create new user (unverified)
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            verified: false,
            otp,
            otpExpiresAt: expiresAt,
        });

        await newUser.save();

        // Send OTP via email
        await sendEmail(email, "Verify Your Email", `Your OTP for verification is: ${otp}`);

        res.status(201).json({ message: "User registered. Check your email for OTP verification." });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};



// Verify OTP controller
const verifyOTP = async (req, res) => {
    try {
        const { email, otp, otpforgot } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Check if OTP is expired
        if (!user.otpExpiresAt || Date.now() > user.otpExpiresAt) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // Check if OTP matches
        if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

        if (otpforgot) {
            // If otpforgot is true, allow resetting password but remove OTP after verification
            user.otp = null;
            user.otpExpiresAt = null;
            await user.save();
            return res.status(200).json({ message: "OTP verified successfully. You can reset your password now.", otpforgot });
        } else {
            // Mark user as verified and remove OTP
            user.verified = true;
            user.otp = null;
            user.otpExpiresAt = null;
            await user.save();
            return res.status(200).json({ message: "Email verified successfully. You can now log in.", otpforgot });
        }
    } catch (error) {
        console.error("OTP Verification Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Resend OTP controller
const resendOTP = async (req, res) => {
    try {
        const { email, otpforgot } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        if (!otpforgot && user.verified) {
            return res.status(400).json({ message: "User already verified." });
        }

        // Generate a new OTP with expiry
        const { otp, expiresAt } = generateOTP();

        // Update OTP and expiry in the database
        user.otp = otp;
        user.otpExpiresAt = expiresAt;
        await user.save();

        // Send OTP via email
        const subject = otpforgot ? "Reset Password OTP" : "Verification OTP";
        await sendEmail(email, subject, `Your OTP is: ${otp}`);

        res.status(200).json({ message: "New OTP sent to your email." });
    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        // Check if the user is verified
        if (!user.verified) return res.status(400).json({ message: "Please verify your email before logging in.", verified:false});

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Send the token to the client
        res.status(200).json({
            user: {
                name: user.name,
                email: user.email,
            },
            message: "Login successful",
            token, // Token for session management
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Generate OTP
        const { otp, expiresAt } = generateOTP();

        // Update OTP and expiry in the database
        user.otp = otp;
        user.otpExpiresAt = expiresAt;
        await user.save();

        // Send OTP via email
        await sendEmail(email, "Forgot Password OTP", `Your OTP for resetting your password is: ${otp}`);

        res.status(200).json({ message: "OTP sent to your email for password reset." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// New Password function
const newPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully. You can now log in with your new password." });
    } catch (error) {
        console.error("New Password Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = { signup, verifyOTP, login, resendOTP, forgotPassword, newPassword};
