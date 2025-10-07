const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

const verifyToken = (allowedRoles = []) => {
  // Handle being used as plain middleware without roles
  if (typeof allowedRoles === "function") {
    return middleware;
  }
  return (req, res, next) => middleware(req, res, next, allowedRoles);
};

const middleware = (req, res, next, allowedRoles = []) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }

    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
