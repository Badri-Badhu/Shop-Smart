const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed_amount', 'custom'],
    },
    value: {
        type: Number,
        required: true,
        min: 0,
    },
    minOrderValue: {
        type: Number,
        default: 0,
        min: 0,
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive', 'expired'],
    },
    usage: {
        totalLimit: {
            type: Number,
            default: null, 
            min: 0,
        },
        totalUsed: {
            type: Number,
            default: 0,
            min: 0,
        },
        perUserLimit: {
            type: Number,
            default: 1,
            min: 1,
        },
    },
    user_history: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            timesUsed: {
                type: Number,
                default: 1,
                min: 1,
            },
        },
    ],
    valid_for_users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    valid_from: {
        type: Date,
        default: Date.now,
    },
    expires_on: {
        type: Date,
        default: null, // Using null as a default for no expiration
    },
    valid_for: {
        product_ids: [{
            type: Schema.Types.ObjectId,
            ref: 'Product',
        }],
        category_names: [String],
    },
    // Optional field for custom coupons
    customRules: {
        type: Object,
        default: {},
    },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);