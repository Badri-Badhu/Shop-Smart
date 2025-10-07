const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String }, // "GOOGLE_AUTH" or hashed password
  phone: { type: String, unique: true, sparse: true },
  role: {
    type: String,
    enum: ["user", "admin", "dealer"],
    default: "user"
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"]
  },
  dob: { type: Date },
  addresses: [
    {
      type: {
        type: String,
        default: "home"
      },
      to:String,
      door_no:String,
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      alt_no: String,
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
