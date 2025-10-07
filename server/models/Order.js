const mongoose = require("mongoose");

// Sub-schema for individual order items.
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  imageUrl: { type: String },
  variant: {
    weight: String,
    unit: String,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  category: { type: String, required: true },
},{ _id: false });

// Sub-schema for grouping products by a specific dealer.
const dealerGroupSchema = new mongoose.Schema({
  dealerId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  
  // Status for this specific dealer's items.
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Packed", "Shipped","Out for Delivery", "Delivered", "Cancelled"],
    default: "Pending",
  },
  delivery_pin:{type:String},
  cancellation_mess:{type:String},
  trackingNumber: { type: String },
  expectedDelivery: { type: Date },
  items: [orderItemSchema],
},{ _id: false });

// Sub-schema for the shipping address, ensuring consistency.
const addressSchema = new mongoose.Schema({
  to: { type: String, required: true },
  type: { type: String },
  door_no: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  contactNo: { type: String, required: true },
  alt_no: { type: String },
}, { _id: false });

const couponSchema = new mongoose.Schema({
  coupon_id:{type:mongoose.Types.ObjectId,ref:"Coupon"},
  code: { type: String },
  description: { type: String },
  discountValue: { type: Number },
  type: { type: String },
}, { _id: false });

// Main Order Schema
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shippingAddress: addressSchema,
    dealerGroups: [dealerGroupSchema],
    coupon: couponSchema,
    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },
    itemsSubtotal: Number,
    totalSavings: Number,
    deliveryCharge: Number,
    couponDiscount: Number,
    grandTotal: Number,
    overallStatus: {
      type: String,
      enum: ["Pending", "Partially Shipped", "Shipped","Completed", "Cancelled"],
      default: "Pending",
    },
    paidAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

// Optional: Pre-save middleware for backend validation.
orderSchema.pre('save', function(next) {
  // Helper to round numbers to 2 decimals
  const round2 = (num) => Math.round(num * 100) / 100;

  // Ensure all relevant fields are numbers
  this.itemsSubtotal = round2(this.itemsSubtotal || 0);
  this.totalSavings = round2(this.totalSavings || 0);
  this.deliveryCharge = round2(this.deliveryCharge || 0);
  this.couponDiscount = round2(this.couponDiscount || 0);

  // Calculate grand total safely
  const calculatedGrandTotal = round2(
    this.itemsSubtotal - this.totalSavings + this.deliveryCharge - this.couponDiscount
  );

  // Only update if different
  if (this.grandTotal !== calculatedGrandTotal) {
    this.grandTotal = calculatedGrandTotal;
    // No warning needed anymore
  }

  next();
});



// Use module.exports instead of export default
module.exports = mongoose.model("Order", orderSchema);