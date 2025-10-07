const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware.js");
const {
  createOrder,
  getOrderById,
  getUserOrders,
  getDealerOrders,
  confirmDeliveryWithPin,
  updateOrderStatus,
} = require("../controllers/orderController.js");

// Route to create a new order
router.post("/", verifyToken(), createOrder);

// --- CORRECTED ORDERING ---

// Most specific routes first
router.get("/myorders", verifyToken(), getUserOrders);

router.get("/dealer", verifyToken(["admin", "dealer"]), getDealerOrders);

// General parameterized routes last
router.get("/:id", verifyToken(), getOrderById);

// Update routes
router.put("/:id/status", verifyToken(["admin", "dealer"]), updateOrderStatus);

router.put("/:id/deliver", verifyToken(["admin", "dealer"]), confirmDeliveryWithPin);

module.exports = router;