const mongoose = require('mongoose');

const EmailOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
   isSignup: { 
    type: Boolean,
    default: false,
  },
  isReset: { 
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '5m', // Automatically delete the OTP after 5 minutes
  },
});

module.exports = mongoose.model('EmailOTP', EmailOTPSchema);
