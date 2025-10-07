const Coupon = require('../models/Coupon');
const User = require('../models/User');

/**
 * Creates a new coupon in the database.
 * This is an admin-only function.
 */
exports.createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            type,
            value,
            minOrderValue,
            expires_on,
            usage,
            valid_for_users,
            valid_for,
            customRules
        } = req.body;

        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            return res.status(409).json({ message: 'A coupon with this code already exists.' });
        }

        const newCoupon = new Coupon({
            code,
            description,
            type,
            value,
            minOrderValue,
            expires_on,
            usage,
            valid_for_users,
            valid_for,
            customRules
        });

        const savedCoupon = await newCoupon.save();
        res.status(201).json(savedCoupon);
    } catch (error) {
        res.status(500).json({ message: 'Error creating coupon', error: error.message });
    }
};

/**
 * Retrieves all coupons from the database.
 * This is an admin-only function.
 */
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        const userRole = req.user?.role || 'unknown'; // get role from req.user set by middleware

        res.status(200).json({
            role: userRole,
            coupons
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons', error: error.message });
    }
};


/**
 * Retrieves a single coupon by its ID.
 * This is an admin-only function.
 */
exports.getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found.' });
        }
        res.status(200).json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupon', error: error.message });
    }
};

/**
 * Updates an existing coupon by its ID.
 * This is an admin-only function.
 */
exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!updatedCoupon) {
            return res.status(404).json({ message: 'Coupon not found.' });
        }
        res.status(200).json(updatedCoupon);
    } catch (error) {
        res.status(500).json({ message: 'Error updating coupon', error: error.message });
    }
};

/**
 * Deletes a coupon by its ID.
 * This is an admin-only function.
 */
exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCoupon = await Coupon.findByIdAndDelete(id);

        if (!deletedCoupon) {
            return res.status(404).json({ message: 'Coupon not found.' });
        }
        res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting coupon', error: error.message });
    }
};

/**
 * Retrieves a list of coupons available to a specific user.
 * This is a public-facing function for the order summary page.
 */
exports.getAvailableCoupons = async (req, res) => {
    const userId = req.query.userId;
    try {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // Step 1: Fetch the core set of coupons that are always visible to everyone.
        // We find coupons with specific codes and ensure they are active and not expired.
        let availableCoupons = await Coupon.find({
            status: 'active',
            code: { $in: ['SAVE30', 'SAVE50', 'SAVE100'] },
            $or: [
                { expires_on: null },
                { expires_on: { $gte: startOfToday } }
            ]
        }).lean();

        // Step 2: Conditionally add user-specific coupons if a userId is provided.
        if (userId) {
            const userSpecificCoupons = await Coupon.find({
                status: 'active',
                'valid_for_users': userId,
                // Exclude the core coupons from this query to avoid duplicates
                code: { $nin: ['SAVE30', 'SAVE50', 'SAVE100'] },
                $or: [
                    { expires_on: null },
                    { expires_on: { $gte: startOfToday } }
                ]
            }).lean();
            // Merge the user-specific coupons into the main array
            availableCoupons.push(...userSpecificCoupons);
        }

        // Step 3: Conditionally add the Birthday coupon.
        if (userId) {
            const user = await User.findById(userId);
            if (user && user.dob) {
                const userDob = new Date(user.dob);
                if (today.getMonth() === userDob.getMonth() && today.getDate() === userDob.getDate()) {
                    const birthdayCoupon = await Coupon.findOne({ code: 'BIRTHDAY' });
                    if (birthdayCoupon) {
                        // Push only if it's not already in the array
                        const isBirthdayCouponPresent = availableCoupons.some(c => c.code === 'BIRTHDAY');
                        if (!isBirthdayCouponPresent) {
                            availableCoupons.push(birthdayCoupon.toObject());
                        }
                    }
                }
            }
        }
        
        // Step 4: Filter out coupons that have reached the per-user limit.
        if (userId) {
            availableCoupons = availableCoupons.filter(coupon => {
                const userHistory = coupon.user_history.find(history => history.userId.toString() === userId.toString());
                const perUserLimit = coupon.usage?.perUserLimit || 1;
                return !userHistory || userHistory.timesUsed < perUserLimit;
            });
        }
        
        // Step 5: Filter out coupons with type 'custom'
        availableCoupons = availableCoupons.filter(coupon => coupon.type !== 'custom');

        // Step 6: Ensure no duplicates.
        const uniqueCoupons = availableCoupons.filter((v, i, a) => a.findIndex(t => (t._id.toString() === v._id.toString())) === i);

        res.status(200).json(uniqueCoupons);
    } catch (err) {
        console.error("Error fetching coupons:", err);
        res.status(500).json({ message: "Error fetching coupons", error: err.message });
    }
};
/**
 * Validates and applies a coupon code submitted by a user.
 * This is a public-facing function.
 */
exports.applyCoupon = async (req, res) => {
    const { couponCode, userId, orderTotal, cartProductIds, source } = req.body;
    
    if (!userId) {
        return res.status(401).json({ success: false, message: 'You must be logged in to apply a coupon.' });
    }

    try {
        const coupon = await Coupon.findOne({
            code: couponCode,
            status: 'active',
            $or: [
                { expires_on: null },
                { expires_on: { $gte: new Date() } }
            ]
        });
        

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
        }
        
        if (coupon.code === 'BIRTHDAY') {
            // FIX: Fetch the entire user document instead of using .select()
            const user = await User.findById(userId);
            const userBirthDate = user?.dob;
            

            if (!userBirthDate) {
                return res.status(403).json({ success: false, message: 'You must have a birthdate set to use this coupon.' });
            }

            const today = new Date();
            const birthDay = userBirthDate.getUTCDate();
            const birthMonth = userBirthDate.getUTCMonth();
            

            if (birthDay !== today.getUTCDate() || birthMonth !== today.getUTCMonth()) {
                return res.status(403).json({ success: false, message: 'This coupon is only valid on your birthday.' });
            }
        }

        if (coupon.valid_for_users.length > 0 && !coupon.valid_for_users.some(id => id.toString() === userId)) {
            return res.status(403).json({ success: false, message: 'This coupon is not valid for you.' });
        }

        const validProductIds = coupon.valid_for?.product_ids || [];
        if (validProductIds.length > 0) {
            const hasValidProduct = cartProductIds.some(cartId => validProductIds.includes(cartId));
            if (!hasValidProduct) {
                return res.status(403).json({ success: false, message: 'This coupon is not valid for any items in your cart.' });
            }
        }
        
        if (coupon.type === 'custom') {
            const customRules = coupon.customRules || {};
            
            if (!source) {
                return res.status(200).json({
                    success: true,
                    message: 'This is a custom coupon. Please provide partner details.',
                    requiresPartnerInput: true,
                    coupon: coupon.toObject() 
                });
            }
            
            const isPartnerRuleMet = (
                customRules.partnerName &&
                source === customRules.partnerName &&
                orderTotal >= (customRules.minOrderValue || 0)
            );

            if (isPartnerRuleMet) {
                return res.status(200).json({
                    success: true,
                    message: `Custom coupon from ${customRules.partnerName} applied!`,
                    coupon: coupon.toObject()
                });
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'The provided partner name is not valid for this coupon or custom conditions were not met.'
                });
            }
        }
        
        const totalUsed = coupon.usage?.totalUsed || 0;
        const totalLimit = coupon.usage?.totalLimit;
        const perUserLimit = coupon.usage?.perUserLimit || 1;

        if (totalLimit !== null && totalUsed >= totalLimit) {
            return res.status(403).json({ success: false, message: 'This coupon has reached its maximum usage limit.' });
        }

        const userUsage = coupon.user_history.find(h => h.userId.toString() === userId);
        if (userUsage && userUsage.timesUsed >= perUserLimit) {
            return res.status(403).json({ success: false, message: 'You have already used this coupon to its limit.' });
        }
        
        res.status(200).json({
            success: true,
            message: 'Coupon applied successfully!',
            coupon: coupon.toObject()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};


/**
 * Finalizes coupon usage after a successful order.
 * This is a public-facing function.
 */
exports. finalizeCouponUsage = async (couponCode, userId) => {
    if (!userId || !couponCode) {
        // Return a meaningful error if arguments are missing
        throw new Error('Coupon code and user ID are required.');
    }

    try {
        const coupon = await Coupon.findOne({ code: couponCode, status: 'active' });
        if (!coupon) {
            throw new Error('Coupon not found.');
        }

        const userUsage = coupon.user_history.find(h => h.userId.toString() === userId);
        let updatedCoupon;

        if (userUsage) {
            updatedCoupon = await Coupon.findOneAndUpdate(
                { code: couponCode, 'user_history.userId': userId },
                { $inc: { 'usage.totalUsed': 1, 'user_history.$.timesUsed': 1 } },
                { new: true }
            );
        } else {
            updatedCoupon = await Coupon.findOneAndUpdate(
                { code: couponCode },
                {
                    $inc: { 'usage.totalUsed': 1 },
                    $push: { 'user_history': { userId: userId, timesUsed: 1 } }
                },
                { new: true }
            );
        }

        if (!updatedCoupon) {
            throw new Error('Failed to update coupon usage.');
        }

        return updatedCoupon; // Return the updated document
    } catch (error) {
        console.error('Error finalizing coupon usage:', error);
        throw error; // Re-throw the error for the caller to handle
    }
};

// module.exports = {
//     createCoupon,
//     getAllCoupons,
//     getCouponById,
//     updateCoupon,
//     deleteCoupon,
//     getAvailableCoupons,
//     applyCoupon,
//     finalizeCouponUsage
// };