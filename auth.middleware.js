const jwt = require("jsonwebtoken");
const User = require("./models/users.model");

const authMiddleware = async (req, res, next) => {
    try {
        // Check for token
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ['HS256'] } // Specify the allowed algorithms
        );

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Attach user object to request
        req.user = user;
        console.log(req.body)
        next();
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;