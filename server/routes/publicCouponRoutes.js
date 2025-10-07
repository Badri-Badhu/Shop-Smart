const express = require('express');
const router = express.Router();
const couponController = require('../controllers/CouponController'); 

// Route for fetching available coupons
router.get('/available', couponController.getAvailableCoupons);

// Route for applying a coupon to an order
router.post('/apply', couponController.applyCoupon);

// New route for finalizing coupon usage after a successful order
router.post('/finalize', couponController.finalizeCouponUsage);

module.exports = router;