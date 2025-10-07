const express = require('express');
const router = express.Router();
const DealerRequest = require('../models/DealerRequest');
const User = require('../models/User');
const Order = require('../models/Order');
const verifyToken = require('../middleware/authMiddleware');

// @route   GET /api/admin/dealer-applications
// @desc    Get all dealer applications (pending, approved, rejected) with user details and order count
// @access  Admin
router.get('/dealer-applications', verifyToken(), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: You are not an admin' });
  }

  try {
    // Fetch all applications
    const requests = await DealerRequest.find({});

    const requestsWithDetails = await Promise.all(requests.map(async (request) => {
      const user = await User.findById(request.user).select('-password');
      if (!user) return null;

      const orderCount = await Order.countDocuments({ user: request.user });
      
      return {
        _id: request._id,
        user: user,
        orderCount: orderCount,
        status: request.status,
        requestedAt: request.requestedAt,
        rejectedAt: request.rejectedAt,
        rejectionReason: request.rejectionReason,
        approvalMessage: request.approvalMessage // Include approval message for completeness
      };
    }));

    res.json(requestsWithDetails.filter(r => r !== null));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/dealer-applications/approve/:id
// @desc    Approve a dealer application
// @access  Admin
router.put('/dealer-applications/approve/:id', verifyToken(), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: You are not an admin' });
  }

  try {
    const requestId = req.params.id;
    const { approvalMessage } = req.body;

    const request = await DealerRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ msg: 'Application not found' });
    }
    
    request.status = 'approved';
    request.approvedAt = Date.now();
    request.approvalMessage = approvalMessage;
    await request.save();

    const user = await User.findById(request.user);
    if (user) {
      user.role = 'dealer';
      await user.save();
    }

    res.json({ msg: 'Application approved and user role updated.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/dealer-applications/reject/:id
// @desc    Reject a dealer application
// @access  Admin
router.put('/dealer-applications/reject/:id', verifyToken(), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: You are not an admin' });
  }

  try {
    const requestId = req.params.id;
    const { reason } = req.body;

    const request = await DealerRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ msg: 'Application not found' });
    }
    
    request.status = 'rejected';
    request.rejectedAt = Date.now();
    request.rejectionReason = reason;
    await request.save();

    res.json({ msg: 'Application rejected.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/dealer-applications/make-pending/:id
// @desc    Change a rejected application's status to pending
// @access  Admin
router.put('/dealer-applications/make-pending/:id', verifyToken(), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: You are not an admin' });
  }

  try {
    const requestId = req.params.id;

    const request = await DealerRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    if (request.status !== 'rejected') {
      return res.status(400).json({ msg: 'Only rejected applications can be made pending.' });
    }
    
    request.status = 'pending';
    request.rejectedAt = undefined;
    request.rejectionReason = undefined;
    await request.save();

    res.json({ msg: 'Application status updated to pending.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET /api/admin/dealers
// @desc    Get a list of all dealers with their order statistics
// @access  Admin
router.get('/dealers', verifyToken(), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: You are not an admin' });
  }

  try {
    const dealers = await User.aggregate([
      // Stage 1: Filter to get only users with the 'dealer' role
      { $match: { role: 'dealer' } },

      // Stage 2: Join with the orders collection based on the dealer's ID
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'dealerGroups.dealerId',
          as: 'allOrders'
        }
      },

      // Stage 3: Unwind the dealerGroups array inside each order
      // This creates a separate document for each item group
      {
        $unwind: {
          path: '$allOrders',
          preserveNullAndEmptyArrays: true // Keep dealers with no orders
        }
      },
      {
        $unwind: {
          path: '$allOrders.dealerGroups',
          preserveNullAndEmptyArrays: true
        }
      },

      // Stage 4: Match the dealer's ID with the dealerId in the unwinded group
      {
        $match: {
          $expr: {
            $eq: ['$_id', '$allOrders.dealerGroups.dealerId']
          }
        }
      },

      // Stage 5: Group by the dealer's ID and count the orders by status
      {
        $group: {
          _id: '$_id',
          firstName: { $first: '$firstName' },
          lastName: { $first: '$lastName' },
          email: { $first: '$email' },
          phone: { $first: '$phone' },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ['$allOrders.dealerGroups.status', 'Pending'] }, 1, 0]
            }
          },
          shippedOrders: {
            $sum: {
              $cond: [{ $eq: ['$allOrders.dealerGroups.status', 'Shipped'] }, 1, 0]
            }
          },
          deliveredOrders: {
            $sum: {
              $cond: [{ $eq: ['$allOrders.dealerGroups.status', 'Delivered'] }, 1, 0]
            }
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ['$allOrders.dealerGroups.status', 'Cancelled'] }, 1, 0]
            }
          },
        }
      },
      
      // Stage 6: Project the final output to reshape the data
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          pendingOrders: 1,
          shippedOrders: 1,
          deliveredOrders: 1,
          cancelledOrders: 1
        }
      }
    ]);

    res.json(dealers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/customers
// @desc    Get a list of all customers with their order count
// @access  Admin
router.get('/customers', verifyToken(), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: You are not an admin' });
  }

  try {
    const customers = await User.aggregate([
      // Stage 1: Filter users to get only customers (non-admin, non-dealer)
      { $match: { role: 'user' } },
      
      // Stage 2: Join the customers with the Order collection
      {
        $lookup: {
          from: 'orders', // The name of the Order collection
          localField: '_id',
          foreignField: 'user',
          as: 'customerOrders'
        }
      },
      
      // Stage 3: Count the number of orders and project required fields
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          createdAt: 1,
          orderCount: { $size: '$customerOrders' }
        }
      }
    ]);

    res.json(customers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET /api/admin/pending-orders
// @desc    Get all orders with pending dealer groups
// @access  Admin
router.get('/pending-orders', verifyToken(), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: You are not an admin' });
  }

  const { status } = req.query; // ✅ Get status from query parameter

  try {
    let query = {};

    // ✅ Conditionally add status filter to the query
    if (status && status !== 'All') {
      query['dealerGroups.status'] = { $in: [status] };
    } else {
      // If no status is specified, we get all in-progress statuses
      query['dealerGroups.status'] = { $in: ["Pending", "Confirmed", "Packed", "Shipped","Out for Delivery", "Delivered", "Cancelled"] };
    }

    // ✅ Use a simpler lookup to avoid the complex aggregation pipeline for now
    const orders = await Order.find(query)
      .populate('user', 'firstName lastName _id')
      .populate({
        path: 'dealerGroups.dealerId',
        select: 'firstName lastName',
        model: 'User'
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/all-orders', verifyToken(), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: You are not an admin' });
  }

  try {
    const orders = await Order.find()
      // populate the customer
      .populate('user', 'firstName lastName _id')

      // populate each product in dealerGroups.items
      .populate({
        path: 'dealerGroups',
        model: 'Product',
        populate: {
          // then populate the dealer (user) for that product
          path: 'dealerId',
          model: 'User',
          select: 'firstName lastName _id'
        }
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


module.exports = router;