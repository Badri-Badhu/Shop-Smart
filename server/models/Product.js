const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
}, { timestamps: true });

const variantSchema = new mongoose.Schema({
  weight: { type: Number, required: true, min: 0 },
  unit: { type: String, default: "g" },
  price: { type: Number, required: true, min: 0 },
  // 🐛 CORRECTION: Added min: 0
  discountPrice: { type: Number,default:null },
  stock: { type: Number, required: true, min: 0 }
});

const productSchema = new mongoose.Schema({
  dealerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ["Fruits", "Vegetables", "Dairy", "Bakery", "Snacks", "Beverages", "Household"],
  },
  description: { type: String },
  brand: { type: String },
  imageUrl: { type: String,required:true },
  images: [{ type: String }],
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: true },

  ratings: { type: Number, default: 0, min: 0, max: 5 },
  reviews: [reviewSchema],

  expiryDate: { type: Date },
  organic: { type: Boolean, default: false },
  popularityScore: { type: Number, default: 0 },

  variants: [variantSchema],

}, { timestamps: true ,strict:true }); 

productSchema.index({
  name: "text",
  category: "text",
  description: "text",
  brand: "text",
  tags: "text",
});
module.exports = mongoose.model("Product", productSchema);