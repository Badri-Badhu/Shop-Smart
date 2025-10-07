// src/controllers/productController.js
const Product = require("../models/Product");
const { cloudinary } = require("../config/cloudinary");
const moment = require('moment');
const Order = require('../models/Order'); // <-- Add this line
const mongoose = require("mongoose");
// Add Product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      brand,
      tags,
      isFeatured,
      isNewArrival,
      expiryDate,
      shelfLife,
      organic,
      popularityScore,
      variants,
      dealerId
    } = req.body;

    if (!name || !category || !req.files || !req.files.image || !dealerId) {
      if (req.files.image) await deleteImagesFromCloudinary(req.files.image.map(f => f.path));
      if (req.files.images) await deleteImagesFromCloudinary(req.files.images.map(f => f.path));
      return res.status(400).json({ error: "Name, category, and main image are required" });
    }

    const mainImage = req.files.image[0].path;
    let images = [];
    if (req.files.images && req.files.images.length > 0) {
      images = req.files.images.map(file => file.path);
    }

    const tagArray = tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim())) : [];
    let parsedVariants = variants ? JSON.parse(variants) : [];
    parsedVariants = parsedVariants.filter(v => v.weight && v.price && v.stock);

    let finalExpiryDate = expiryDate;
    if (shelfLife) {
      const addedDate = new Date();
      addedDate.setDate(addedDate.getDate() + parseInt(shelfLife, 10));
      finalExpiryDate = addedDate;
    }

    const newProduct = new Product({
      name,
      category,
      description: description || "",
      brand: brand || "",
      imageUrl: mainImage,
      images,
      tags: tagArray,
      isFeatured: isFeatured === "true" || false,
      isNewArrival: isNewArrival === "true" || true,
      expiryDate: finalExpiryDate || null,
      organic: organic === "true" || false,
      popularityScore: popularityScore || 0,
      variants: parsedVariants,
      dealerId,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while adding product" });
  }
};

// Get all products - MODIFIED
const getProducts = async (req, res) => {
  try {
    const { category, dealerId } = req.query; // Extract optional filters from the query string

    let filter = {};
    if (category && category !== 'All') {
      filter.category = category; // Filter by category if provided
    }
    
    if (dealerId) {
      filter.dealerId = dealerId; // Filter by dealerId if provided
    }

    // Use .populate() to get the dealer's first and last name
    // The filter object handles whether to fetch all or specific products
    const products = await Product.find(filter)
      .populate('dealerId', 'firstName lastName') 
      .sort({ createdAt: 1 });

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching products" });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching product" });
  }
};



// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await deleteImagesFromCloudinary([product.imageUrl, ...product.images]);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while deleting product" });
  }
};
// Get products by dealer ID
const getProductsByDealerId = async (req, res) => {
  try {
    let dealerId;
    if (req.user.role === "dealer") {
      dealerId = req.user.id; // dealers can only access their own products
    } else {
      dealerId = req.params.dealerId; // admin can access any dealer
    }

    const products = await Product.find({ dealerId }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching dealer products" });
  }
};

// A more robust and explicit Cloudinary public ID extraction
// Extracts "<folder>/<public_id>" from a Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    // Cloudinary URLs look like: https://res.cloudinary.com/<cloud>/image/upload/v12345/<folder>/<public_id>.ext
    const parts = url.split('/');
    const publicIdWithExt = parts.pop();
    const folderName = parts.pop();
    if (!publicIdWithExt || !folderName) return null;
    return `${folderName}/${publicIdWithExt.split('.')[0]}`;
  } catch (err) {
    console.error('Error extracting public_id:', err, url);
    return null;
  }
};

// Delete multiple images from Cloudinary
const deleteImagesFromCloudinary = async (imageUrls = []) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;
  try {
    const publicIds = imageUrls
      .map(getPublicIdFromUrl)
      .filter(Boolean);

    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
      console.log('Deleted old images from Cloudinary:', publicIds);
    }
  } catch (err) {
    console.error('Error deleting images from Cloudinary:', err);
  }
};

const updateProduct = async (req, res) => {
  try {
    // 1. Find the product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 2. Parse variants safely
    let parsedVariants = [];
    if (req.body.variants) {
      try {
        parsedVariants =
          typeof req.body.variants === 'string'
            ? JSON.parse(req.body.variants)
            : req.body.variants;
      } catch (err) {
        console.error('Error parsing variants:', err);
        return res.status(400).json({ error: 'Invalid variants data.' });
      }
    }

    // 3. Update basic fields
    const boolFields = ['isFeatured', 'isNewArrival', 'organic'];
    boolFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Accept booleans or "true"/"false"
        product[field] =
          typeof req.body[field] === 'boolean'
            ? req.body[field]
            : req.body[field] === 'true';
      }
    });

    ['name', 'category', 'description', 'brand'].forEach((field) => {
      if (req.body[field]) product[field] = req.body[field];
    });

    if (req.body.tags) {
      product.tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : req.body.tags.split(',').map((t) => t.trim());
    }

    if (req.body.popularityScore !== undefined) {
      product.popularityScore = Number(req.body.popularityScore);
    }

    // Expiry date / shelf life
    if (req.body.shelfLife !== undefined && !isNaN(req.body.shelfLife)) {
      const addedDate = new Date();
      addedDate.setDate(addedDate.getDate() + parseInt(req.body.shelfLife, 10));
      product.expiryDate = addedDate;
    } else if (req.body.expiryDate) {
      product.expiryDate = new Date(req.body.expiryDate);
    }

    // Variants
    if (parsedVariants.length > 0) {
      product.variants = parsedVariants.filter(
        (v) => v.weight && v.price && v.stock
      );
    }

    // 4. Handle images
    // Images to delete
    let imagesToDelete = [];
    if (req.body.imagesToDelete) {
      try {
        imagesToDelete =
          typeof req.body.imagesToDelete === 'string'
            ? JSON.parse(req.body.imagesToDelete)
            : req.body.imagesToDelete;
      } catch (err) {
        console.error('Error parsing imagesToDelete:', err);
      }
    }

    if (imagesToDelete.length > 0) {
      await deleteImagesFromCloudinary(imagesToDelete);
      product.images = (product.images || []).filter(
        (imgUrl) => !imagesToDelete.includes(imgUrl)
      );
    }

    // Add new additional images
    if (req.files?.images?.length > 0) {
      const newAdditionalImages = req.files.images.map((f) => f.path);
      product.images = [...(product.images || []), ...newAdditionalImages];
    }

    // Handle main image update
    if (req.files?.image?.length > 0) {
      // Delete the old main image if it exists
      if (product.imageUrl) {
        await deleteImagesFromCloudinary([product.imageUrl]);
      }
      product.imageUrl = req.files.image[0].path;
    }

    // 5. Save
    await product.save();
    return res
      .status(200)
      .json({ message: 'Product updated successfully', product });
  } catch (err) {
    console.error('Error updating product:', err);
    return res
      .status(500)
      .json({ error: 'Server error while updating product' });
  }
};


const getAnalyticsData = async (req, res) => {
  try {
    const dealerId = req.query.dealerId || (req.user && req.user._id);
    if (!dealerId) return res.status(400).json({ error: "Dealer ID is required." });

    // Validate ObjectId
    let dealerFilter = dealerId;
    if (mongoose.Types.ObjectId.isValid(dealerId)) {
      dealerFilter = new mongoose.Types.ObjectId(dealerId);
    }

    // Fetch all orders for this dealer
    const orders = await Order.find({ "dealerGroups.dealerId": dealerFilter });

    const totalOrders = orders.length;
    let earnedRevenue = 0; // Delivered
    let pendingRevenue = 0; // Not delivered yet
    let totalDealerDiscount = 0; // new KPI

    orders.forEach(order => {
      const dealerGroup = order.dealerGroups.find(d => d.dealerId.toString() === dealerId.toString());
      if (!dealerGroup) return;

      // Calculate dealer's total amount for this order
      const dealerAmount = dealerGroup.items.reduce((sum, item) => {
        const price = item.discountPrice ?? item.price;
        return sum + price * item.quantity;
      }, 0);

      // Split coupon discount proportionally if applied
      let dealerCouponDiscount = 0;
      if (order.coupon && order.grandTotal && order.dealerGroups.length > 0) {
        const totalBeforeDiscount = order.dealerGroups.reduce((sum, dg) => {
          return sum + dg.items.reduce((s, item) => s + (item.discountPrice ?? item.price) * item.quantity, 0);
        }, 0);
        dealerCouponDiscount = totalBeforeDiscount > 0
          ? (dealerAmount / totalBeforeDiscount) * (order.coupon.discountValue || 0)
          : 0;
        totalDealerDiscount += dealerCouponDiscount;
      }

     const netDealerAmount = dealerAmount - dealerCouponDiscount;

      if (dealerGroup.status === "Delivered") {
        earnedRevenue += netDealerAmount;
      } else {
        pendingRevenue += netDealerAmount;
      }

    });

    const totalRevenue = earnedRevenue + pendingRevenue;
    const avgOrderValue = totalOrders > 0 ? earnedRevenue / totalOrders : 0;

    // Order trend
    const orderTrendAgg = await Order.aggregate([
      { $match: { "dealerGroups.dealerId": dealerFilter } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const orderTrend = orderTrendAgg.map(r => ({ date: r._id, orders: r.orders }));

    // Top products
    const topProductsAgg = await Order.aggregate([
      { $match: { "dealerGroups.dealerId": dealerFilter } },
      { $unwind: "$dealerGroups" },
      { $match: { "dealerGroups.dealerId": dealerFilter } },
      { $unwind: "$dealerGroups.items" },
      {
        $group: {
          _id: "$dealerGroups.items.name",
          count: { $sum: "$dealerGroups.items.quantity" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const topProducts = topProductsAgg.map(r => ({ name: r._id, count: r.count }));

    // Order status counts
    const statusCountsAgg = await Order.aggregate([
      { $match: { "dealerGroups.dealerId": dealerFilter } },
      { $unwind: "$dealerGroups" },
      { $match: { "dealerGroups.dealerId": dealerFilter } },
      {
        $group: {
          _id: "$dealerGroups.status",
          count: { $sum: 1 },
        },
      },
    ]);

    const orderStatusCounts = {
      Pending: 0,
      Confirmed: 0,
      Packed: 0,
      Shipped: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Cancelled: 0,
    };
    statusCountsAgg.forEach(r => { orderStatusCounts[r._id] = r.count; });


    const ordersByCategoryAgg = await Order.aggregate([
          { $match: { "dealerGroups.dealerId": dealerFilter } },
          { $unwind: "$dealerGroups" },
          { $match: { "dealerGroups.dealerId": dealerFilter } },
          { $unwind: "$dealerGroups.items" },
          {
            $group: {
              _id: "$dealerGroups.items.category",
              count: { $sum: "$dealerGroups.items.quantity" },
            },
          },
          { $sort: { count: -1 } },
        ]);
        const ordersByCategory = ordersByCategoryAgg.map(r => ({ category: r._id, count: r.count }));



    // Send response
    res.json({
      totalOrders,
      totalRevenue,
      earnedRevenue,
      pendingRevenue,
      avgOrderValue: Number(avgOrderValue.toFixed(2)),
      totalDealerDiscount: Number(totalDealerDiscount.toFixed(2)), // new KPI
      orderTrend,
      topProducts,
      ordersByCategory,
      ...orderStatusCounts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const searchProducts = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }

    // Create a case-insensitive regular expression for partial matching
    const regex = new RegExp(query, 'i');

    const products = await Product.find({
      $or: [
        { name: { $regex: regex } },
        { category: { $regex: regex } },
        { description: { $regex: regex } },
        { brand: { $regex: regex } },
        { tags: { $in: [regex] } },
      ],
    });

    res.json(products);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error during search." });
  }
};




// Export all controller functions
module.exports = {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
 getProductsByDealerId,
 getAnalyticsData,
 searchProducts
};