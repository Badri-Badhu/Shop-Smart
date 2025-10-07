const express = require('express');
const router = express.Router();
const couponController = require('../controllers/CouponController');
const verifyAdmin = require('../middleware/verifyAdmin');

// All authentication middleware has been removed.
router.get('/allcoupons', verifyAdmin, couponController.getAllCoupons);

router.post('/coupons',verifyAdmin, couponController.createCoupon);
router.get('/coupons/:id',verifyAdmin, couponController.getCouponById);
router.put('/coupons/:id',verifyAdmin, couponController.updateCoupon);
router.delete('/coupons/:id', verifyAdmin,couponController.deleteCoupon);

module.exports = router;