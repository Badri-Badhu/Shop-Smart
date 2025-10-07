const asyncHandler = require("express-async-handler");
const Order = require("../models/Order.js");
const User = require("../models/User.js");
const Product = require("../models/Product.js");
const { finalizeCouponUsage } = require("../controllers/CouponController.js"); // Import the function
const Coupon = require('../models/Coupon.js'); 
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { cartItems, shippingAddress, paymentMethod, coupon } = req.body;

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    res.status(400);
    throw new Error("No order items found in cart");
  }
  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  const dealerGroups = {};
  let itemsSubtotal = 0;
  let totalSavings = 0;

  const round2 = (num) => Math.round(num * 100) / 100;

  for (const item of cartItems) {
    if (!item.productId) {
      res.status(400);
      throw new Error("Cart item missing productId");
    }

    const product = await Product.findById(item.productId);
    if (!product) {
      res.status(404);
      throw new Error(`Product with ID ${item.productId} not found`);
    }
    if (!product.dealerId) {
      res.status(400);
      throw new Error(`Product '${product.name}' is missing a dealer ID.`);
    }

    const selectedVariant = product.variants.find(
      (v) => v.weight === item.variant.weight && v.unit === item.variant.unit
    );
    if (!selectedVariant) {
      res.status(400);
      throw new Error("Product variant not found.");
    }

    const itemPrice = round2(Number(selectedVariant.price) || 0);
    const itemDiscountPrice =
      selectedVariant.discountPrice != null
        ? round2(Number(selectedVariant.discountPrice))
        : itemPrice;

    itemsSubtotal = round2(itemsSubtotal + itemPrice * item.quantity);
    totalSavings = round2(totalSavings + (itemPrice - itemDiscountPrice) * item.quantity);

    if (!dealerGroups[product.dealerId]) {
      dealerGroups[product.dealerId] = { dealerId: product.dealerId, items: [] };
    }

    dealerGroups[product.dealerId].items.push({
      product: product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      variant: item.variant || { weight: "", unit: "" },
      quantity: item.quantity,
      price: itemPrice,
      category: product.category,
      discountPrice: itemDiscountPrice,
    });
  }

  const deliveryCharge = itemsSubtotal < 200 ? 32 : 0;

  // Backend computes coupon discount
  let couponDiscount = 0;
  let verifiedCoupon = null;

  if (coupon && coupon.code) {
    const dbCoupon = await Coupon.findOne({ code: coupon.code, status: "active" });
    if (dbCoupon) {
      const discountVal =
        dbCoupon.type === "percentage"
          ? round2(itemsSubtotal * dbCoupon.value / 100)
          : round2(dbCoupon.value);

      verifiedCoupon = {
        coupon_id: dbCoupon._id,  
        code: dbCoupon.code,
        description: dbCoupon.description,
        discountValue: discountVal,
        type: dbCoupon.type,
      };
      couponDiscount = discountVal;
    }
  }

  // Explicitly calculate grandTotal to avoid middleware warning
  const grandTotal = round2(itemsSubtotal - totalSavings + deliveryCharge - couponDiscount);

  const order = new Order({
    user: req.user.id,
    shippingAddress: {
      to: shippingAddress.to,
      type: shippingAddress.type,
      door_no: shippingAddress.door_no,
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      contactNo: shippingAddress.contactNo,
      alt_no: shippingAddress.alt_no || null,
    },
    dealerGroups: Object.values(dealerGroups),
    paymentMethod,
    itemsSubtotal,
    totalSavings,
    deliveryCharge,
    coupon: verifiedCoupon,
    couponDiscount,
    grandTotal, // explicitly set
    paidAt: paymentMethod === "Online" ? new Date() : undefined,
  });

  const createdOrder = await order.save();

  if (verifiedCoupon && verifiedCoupon.code) {
    try {
      await finalizeCouponUsage(verifiedCoupon.code, req.user.id);
    } catch (error) {
      console.error(
        "Failed to finalize coupon usage for order:",
        createdOrder._id,
        error
      );
    }
  }

  res.status(201).json({
    orderId: createdOrder._id,
    message: "Order placed successfully",
  });
});


// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Get all orders for the logged-in user
// @route   GET /api/orders/myorders
// @access  Private

  const getUserOrders = asyncHandler(async (req, res) => {
    
      // Step 1: Find all orders and populate the product details
      const orders = await Order.find({ user: req.user.id })
          .populate({
              path: 'dealerGroups.items.product',
              model: 'Product',
          })
          .sort({ createdAt: -1 });

      // Step 2: Manually loop through the orders to fetch and attach dealer details
      const ordersWithDealerInfo = await Promise.all(
          orders.map(async (order) => {
              const populatedDealerGroups = await Promise.all(
                  order.dealerGroups.map(async (group) => {
                      const dealerId = group.items[0]?.product?.dealerId;
                      
                      let dealerDetails = null;
                      if (dealerId) {
                          // FIX: Correct capitalization in the select statement
                          dealerDetails = await User.findById(dealerId).select('firstName lastName').lean();
                      }
                      
                      return {
                          ...group.toObject(),
                          dealerDetails: dealerDetails,
                      };
                  })
              );
              
              return {
                  ...order.toObject(),
                  dealerGroups: populatedDealerGroups,
              };
          })
      );

      res.json(ordersWithDealerInfo);
  });




// @desc    Update order status by ID (for admins or dealers)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    const { dealerId, newStatus, reason } = req.body;

    const dealerGroupToUpdate = order.dealerGroups.find(
        (group) => group.dealerId.toString() === dealerId
    );

    if (!dealerGroupToUpdate) {
        res.status(404);
        throw new Error("Dealer group not found in this order");
    }

    // --- Safe handling for deleted products ---
    dealerGroupToUpdate.items = dealerGroupToUpdate.items.map(item => {
        if (!item.product) {
            // Product has been deleted
            return {
                ...item.toObject?.() || item,
                name: item.name || "Deleted product",
                imageUrl: item.imageUrl || "/placeholder.jpg"
            };
        }
        return item;
    });

    // --- Safe handling for deleted coupon ---
    if (order.coupon && typeof order.coupon === "string") {
        console.warn(`Coupon field is a string in order ${order._id}, setting to null`);
        order.coupon = null; // Prevent validation errors
    }

    // Check if the status is changing to 'Out for Delivery' and generate a PIN
    if (newStatus === 'Out for Delivery' && !dealerGroupToUpdate.delivery_pin) {
        const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
        dealerGroupToUpdate.delivery_pin = deliveryPin;
    } else if (newStatus !== 'Out for Delivery' && newStatus !== 'Delivered') {
        // If status is not 'Out for Delivery' or 'Delivered', clear the PIN
        dealerGroupToUpdate.delivery_pin = null;
    }

    // Update status
    dealerGroupToUpdate.status = newStatus;

    // --- Store cancellation reason if order is cancelled ---
    if (newStatus === 'Cancelled') {
        dealerGroupToUpdate.cancellation_mess = reason || 'Cancelled by dealer';
    } else {
        dealerGroupToUpdate.cancellation_mess = null;
    }

    // --- Recalculate overallStatus ---
    const allStatuses = order.dealerGroups.map(group => group.status);

    const allFinalized = allStatuses.every(status => 
      ['Delivered', 'Cancelled'].includes(status)
    );
    const allShipped = allStatuses.every(status =>
      ['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(status)
    );
    const anyShipped = allStatuses.some(status =>
      ['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(status)
    );
    const anyPending = allStatuses.some(status => 
      ['Pending', 'Confirmed', 'Packed'].includes(status)
    );

    if (allFinalized) {
        order.overallStatus = 'Completed';
    } else if (allStatuses.every(status => status === 'Cancelled')) {
        order.overallStatus = 'Completed';
    } else if (allShipped) {
        order.overallStatus = 'Shipped';
    } else if (anyShipped && anyPending) {
        order.overallStatus = 'Partially Shipped';
    } else {
        order.overallStatus = 'Pending';
    }

    // --- Save updated order ---
    try {
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (err) {
        console.error(`Failed to save order ${order._id}:`, err);
        res.status(500).json({ message: "Failed to update order status due to invalid data" });
    }
});



// b) New Controller to Verify PIN and Deliver
// @desc    Verify PIN and deliver order
// @route   PUT /api/orders/:id/deliver
// @access  Private/Dealer
const confirmDeliveryWithPin = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    const { dealerId, pin } = req.body;
    const dealerGroupToUpdate = order.dealerGroups.find(
        (group) => group.dealerId.toString() === dealerId
    );

    if (!dealerGroupToUpdate) {
        return res.status(404).json({ message: "Dealer group not found in this order" });
    }

    if (dealerGroupToUpdate.status !== 'Out for Delivery') {
        return res.status(400).json({ message: "Order is not out for delivery." });
    }
    
    if (dealerGroupToUpdate.delivery_pin !== pin) {
        return res.status(400).json({ message: "Invalid delivery PIN." });
    }

    dealerGroupToUpdate.status = 'Delivered';
    dealerGroupToUpdate.delivery_pin = null; // Clear the pin after successful delivery
    const updatedOrder = await order.save();
    res.json(updatedOrder);
});


// @desc    Get all orders for a specific dealer
// @route   GET /api/orders/dealer
// @access  Private/Dealer
const getDealerOrders = asyncHandler(async (req, res) => {
    // We get the dealer's ID from the authenticated user token
    const dealerId = req.user.id;

    // Find all orders that contain products from this dealer
    const orders = await Order.find({ "dealerGroups.dealerId": dealerId })
        .populate({
            path: 'dealerGroups.items.product',
            model: 'Product',
        })
        .sort({ createdAt: -1 });
    
    // Manually loop through the orders to fetch and attach dealer details
    const ordersWithDealerInfo = await Promise.all(
        orders.map(async (order) => {
            const populatedDealerGroups = await Promise.all(
                order.dealerGroups.map(async (group) => {
                    const groupDealerId = group.items[0]?.product?.dealerId;
                    
                    let dealerDetails = null;
                    if (groupDealerId) {
                        dealerDetails = await User.findById(groupDealerId).select('firstName lastName').lean();
                    }
                    
                    return {
                        ...group.toObject(),
                        dealerDetails: dealerDetails,
                    };
                })
            );
            
            return {
                ...order.toObject(),
                dealerGroups: populatedDealerGroups,
            };
        })
    );

    res.json(ordersWithDealerInfo);
});



module.exports = {
  createOrder,
  getOrderById,
  getDealerOrders,
  getUserOrders,
  updateOrderStatus,
  confirmDeliveryWithPin
};
