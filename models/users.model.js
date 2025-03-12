const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String, // Store OTP as a string
            default: null, // Null if not set
        },
        otpExpiresAt: {
            type: Number, // Store timestamp (milliseconds)
            default: null,
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

const User = mongoose.model("User", userSchema);

module.exports = User;
