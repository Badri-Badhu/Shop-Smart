const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");
const auth = require('../middleware/authMiddleware');

const {
  signup,
  login,
  handleSocialLogin,
  sendEmailOtp,
  verifyEmailOtp,
  sendPasswordResetOtp,
  resetPasswordWithOtp,
  changePassword,
  sendSignupOtp,
  verifySignupOtp // ✅ FIXED: The missing import is now here
} = require("../controllers/authControllers");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// 🔹 GOOGLE AUTH
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  handleSocialLogin
);

// 🔹 NORMAL SIGNUP / LOGIN
router.post("/signup", signup);
router.post("/login", login);

router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);

// 🔹 PASSWORD MANAGEMENT ROUTES
router.post('/send-password-reset-otp', sendPasswordResetOtp);
router.post('/reset-password-otp', resetPasswordWithOtp);
router.post('/change-password', auth(), changePassword);

// ✅ NEW: Route for sending OTP during signup
router.post("/send-signup-otp", sendSignupOtp);
router.post("/verify-signup-otp", verifySignupOtp);

// 🔹 GET LOGGED-IN USER
router.get("/user", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error("User fetch error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
