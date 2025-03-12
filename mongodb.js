const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECT_URI);
        console.log("MongoDB Connected!");
    } catch (error) {
        console.error("Database Connection Error:", error);
    }
};

module.exports = connectDB;
