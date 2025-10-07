const mongoose = require('mongoose');

const DealerRequestSchema = new mongoose.Schema({
  // Link to the user who is making the request
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference the User model
    required: true,
    unique: true // A user can only have one pending dealer request
  },

  // The current status of the application
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // Timestamps for tracking the request lifecycle
  requestedAt: {
    type: Date,
    default: Date.now
  },

  approvedAt: {
    type: Date
  },

  rejectedAt: {
    type: Date
  },
  
  // Optional: A reason for rejection if the status is 'rejected'
  rejectionReason: {
    type: String
  },
  approvalMessage: {
    type: String
  }
});

module.exports = mongoose.model('DealerRequest', DealerRequestSchema);