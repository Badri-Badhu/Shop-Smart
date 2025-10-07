const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/User");
const DealerRequest = require("../models/DealerRequest"); // ✅ Import the DealerRequest model
const verifyToken = require("../middleware/authMiddleware");

// ✅ Get logged-in user profile (protected)
router.get("/profile", verifyToken(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get user by ID (optionally protected)
router.get("/:id", verifyToken(), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Update user by ID (protected)
router.put("/:id", verifyToken(), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ New route for dealer application
router.post("/dealer-application", verifyToken(), async (req, res) => {
  try {
    // Check if the user ID from the token is valid
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ msg: "Invalid user ID from token." });
    }

    // Check if the user already has a pending or approved request
    const existingRequest = await DealerRequest.findOne({ user: req.user.id });
    if (existingRequest) {
      return res.status(400).json({ msg: "You have already submitted a dealer application." });
    }

    // Create a new dealer request
    const newRequest = new DealerRequest({
      user: req.user.id, // Use the user ID from the authenticated token
    });

    await newRequest.save();
    res.status(201).json({ msg: "Dealer application submitted successfully.", request: newRequest });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;