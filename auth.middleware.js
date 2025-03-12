const jwt = require("jsonwebtoken");
const User = require("./models/users.model");   

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user using decoded.userId
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Attach user object to request
        req.user = user;
        next();
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired token." });
    }
};
