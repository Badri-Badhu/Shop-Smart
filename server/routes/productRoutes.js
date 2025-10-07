const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });
const verifyToken=require('../middleware/authMiddleware')
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByDealerId,
  getAnalyticsData,searchProducts
} = require("../controllers/productController");
// Add product (main image + multiple images)
router.post("/add", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 5 }
]), verifyToken(["admin", "dealer"]),addProduct);

// Get all products
router.get("/", getProducts);

router.get("/search", searchProducts);




// Update product by ID (support new images)
router.put("/:id", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 5 }
]),verifyToken(["admin", "dealer"]), updateProduct);


// Delete product by ID
router.delete("/:id", verifyToken(["admin", "dealer"]),deleteProduct);
router.get("/dealer/:dealerId", verifyToken(["admin", "dealer"]),getProductsByDealerId);
router.get('/analytics/dealer',verifyToken(["admin", "dealer"]), getAnalyticsData);

// Get single product by ID
router.get("/:id", getProductById);
module.exports = router;
