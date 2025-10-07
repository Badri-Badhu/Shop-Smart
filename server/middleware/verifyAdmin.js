const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "Unauthorized: No token" });

        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ message: "Unauthorized: Token missing" });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Unauthorized: Invalid token", error: err.message });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: "Unauthorized: User not found" });

        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }

        req.user = user; // attach user to request
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};
