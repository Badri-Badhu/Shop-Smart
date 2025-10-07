const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const productRoutes = require('./routes/productRoutes');
const adminCouponRoutes = require('./routes/CouponRoutes');
const publicCouponRoutes = require('./routes/publicCouponRoutes');
const orderRoutes =require('./routes/orderRoutes');
const adminRoutes=require('./routes/adminRoutes');

require("./config/passport"); // 🔐 Google OAuth strategy

const app = express();
const PORT = process.env.PORT || 5000;

// 🛡️ CORS Setup
app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// 🔧 Middleware
app.use(express.json());
app.use(session({
  secret: "Thagedele",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// 📦 Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
app.use('/api/products', productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use('/api/Admin', adminRoutes);

app.use('/api/coupons', publicCouponRoutes);
app.use('/api/admin', adminCouponRoutes);

app.use("/api/orders", orderRoutes);


// 🌐 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection failed:", err));

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`🔥 Server running at: http://localhost:${PORT}`);
});
