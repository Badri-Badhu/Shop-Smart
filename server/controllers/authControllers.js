const User = require("../models/User");
const EmailOTP = require("../models/EmailOtp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer"); // REMOVE Nodemailer

const Brevo = require("@getbrevo/brevo"); // ADD Brevo import

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// JWT Token generator
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Nodemailer transporter setup 
// const transporter = nodemailer.createTransport({  
//  service: "gmail",   
// auth: {     user: process.env.EMAIL_USER,     pass: process.env.EMAIL_PASS, 
//   }, });


// Brevo setup
const brevo = new Brevo.TransactionalEmailsApi();
brevo.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// ---------------------- HELPER FUNCTION ----------------------
const sendBrevoEmail = async (toEmail, subject, htmlContent) => {
  try {
    await brevo.sendTransacEmail({
      sender: { name: "Shop Smart", email: process.env.EMAIL_USER },
      to: [{ email: toEmail }],
      subject,
      htmlContent,
    });
    console.log(`✅ Email sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ Brevo email error:", error);
    throw error;
  }
};


// ✅ Signup Controller
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, dob, gender, role, address1, address2 } = req.body;
    if (!phone) {
      return res
        .status(400)
        .json({ message: "Phone number is required for signup" });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, email, phone, password: hashedPassword, dob, gender, role, address1, address2 });
    await user.save();
    res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Login Controller
const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if (!password || (!email && !phone)) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.password === "GOOGLE_AUTH") {
      return res.status(401).json({ message: "Please login using your Google account" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user);
    const { password: _, ...userData } = user.toObject();
    res.status(200).json({ message: "Login successful", token, user: userData, authType: "email" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Social Login Controller
const handleSocialLogin = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${CLIENT_URL}/login-form?message=Login%20failed&type=error`);
    }
    const token = generateToken(user);
    const { password: _, ...userData } = user.toObject();
    const authType="google";
    res.redirect(`${CLIENT_URL}/home?token=${token}&authType=${authType}&message=Login%20successful&type=success`);
  } catch (err) {
    console.error("Social login error:", err);
    res.redirect(`${CLIENT_URL}/login-form?message=Server%20error%20during%20login&type=error`);
  }
};

// ✅ Send OTP to Email for SIGNUP/LOGIN  using node mailer
// const sendEmailOtp = async (req, res) => {
//   const { email } = req.body;
//   if (!email) return res.status(400).json({ message: "Email is required" });
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(403).json({ message: "User not found. Please signup." });
//     }
//     if (user.password === "GOOGLE_AUTH") {
//       return res.status(403).json({ message: "This account uses Google login. Please login with Google." });
//     }
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     await EmailOTP.deleteMany({ email });
//     await EmailOTP.create({ email, otp });
//     await transporter.sendMail({
//       from: `"Shop Smart" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Your Login OTP Code For Shop Smart",
//       html: `<h2>Your OTP is: ${otp}</h2><p>It is valid for 5 minutes.</p>`,
//     });
//     res.status(200).json({ message: "OTP sent to email" });
//   } catch (err) {
//     console.error("Email OTP error:", err);
//     res.status(500).json({ message: "Failed to send OTP", error: err.message });
//   }
// };

const sendEmailOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(403).json({ message: "User not found. Please signup." });
    if (user.password === "GOOGLE_AUTH")
      return res.status(403).json({ message: "Use Google login." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await EmailOTP.deleteMany({ email });
    await EmailOTP.create({ email, otp });

    await sendBrevoEmail(
      email,
      "Your Login OTP Code For Shop Smart",
      `<h2>Your OTP is: ${otp}</h2><p>It is valid for 5 minutes.</p>`
    );

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Email OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};


// ✅ Verify Email OTP
const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await EmailOTP.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: "User not found. Please signup." });
    }
    await EmailOTP.deleteMany({ email });
    const token = generateToken(user);
    const { password: _, ...userData } = user.toObject();
    res.status(200).json({ message: "OTP verified", token, user: userData });
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Send OTP for Password Reset (NEW FUNCTION) using nodemailer
// const sendPasswordResetOtp = async (req, res) => {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ message: "Email is required" });

//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
//         await EmailOTP.deleteMany({ email });
//         await EmailOTP.create({ email, otp, isReset: true });

//         await transporter.sendMail({
//             from: `"Shop Smart" <${process.env.EMAIL_USER}>`,
//             to: email,
//             subject: "Your Password Reset Code",
//             html: `<h2>Your OTP for password reset is: ${otp}</h2><p>It is valid for 5 minutes.</p>`,
//         });

//         res.status(200).json({ success: true, message: "Password reset OTP sent to email." });
//     } catch (err) {
//         console.error("Password reset OTP error:", err);
//         res.status(500).json({ message: "Failed to send OTP", error: err.message });
//     }
// };

const sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await EmailOTP.deleteMany({ email });
    await EmailOTP.create({ email, otp, isReset: true });

    await sendBrevoEmail(
      email,
      "Your Password Reset Code",
      `<h2>Your OTP for password reset is: ${otp}</h2><p>It is valid for 5 minutes.</p>`
    );

    res.status(200).json({ success: true, message: "Password reset OTP sent to email." });
  } catch (err) {
    console.error("Password reset OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};


// ✅ Password Reset using OTP (UPDATED TO USE NEW OTP FLOW)
const resetPasswordWithOtp = async (req, res) => {
    try {
        const { email, newPassword, otp } = req.body;
        
        const otpRecord = await EmailOTP.findOne({ email, otp, isReset: true });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        
        await EmailOTP.deleteMany({ email });

        res.status(200).json({ success: true, message: "Password reset successfully." });
    } catch (error) {
        console.error("Password reset with OTP error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Password Change with Old Password
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid old password." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: "Password changed successfully." });
    } catch (error) {
        console.error("Password change error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
// ✅ Corrected sendSignupOtp function using node mailer
// const sendSignupOtp = async (req, res) => {
//   const { email } = req.body;
//   if (!email) return res.status(400).json({ message: "Email is required" });

//   try {
//     // Check if the email is already in use
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User with this email already exists." });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     await EmailOTP.deleteMany({ email });
//     // FIX: Add the isSignup flag
//     await EmailOTP.create({ email, otp, isSignup: true }); 

//     await transporter.sendMail({
//       from: `"Shop Smart" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Your Signup OTP Code",
//       html: `<h2>Your OTP is: ${otp}</h2><p>It is valid for 5 minutes.</p>`,
//     });

//     res.status(200).json({ message: "OTP sent to email for signup." });
//   } catch (err) {
//     console.error("Signup OTP error:", err);
//     res.status(500).json({ message: "Failed to send OTP", error: err.message });
//   }
// };

const sendSignupOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User with this email already exists." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await EmailOTP.deleteMany({ email });
    await EmailOTP.create({ email, otp, isSignup: true });

    await sendBrevoEmail(
      email,
      "Your Signup OTP Code",
      `<h2>Your OTP is: ${otp}</h2><p>It is valid for 5 minutes.</p>`
    );

    res.status(200).json({ message: "OTP sent to email for signup." });
  } catch (err) {
    console.error("Signup OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};



// ✅ Verify OTP for SIGNUP (NEW FUNCTION)
const verifySignupOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

  try {
    const record = await EmailOTP.findOne({ email, otp, isSignup: true });
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // OTP is valid. Now you can safely create the user in the main signup function.
    res.status(200).json({ success: true, message: "OTP verified successfully." });
  } catch (err) {
    console.error("Signup OTP verification error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  signup,
  login,
  handleSocialLogin,
  sendEmailOtp,
  verifyEmailOtp,
  sendSignupOtp,
  verifySignupOtp,
  sendPasswordResetOtp,
  resetPasswordWithOtp,
  changePassword,
};
