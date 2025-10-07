import React, { useState, useEffect } from 'react';
import FlashMessage from '../../../components/common/FlashMessage';
import './css/PendingOrders.css';
import RouteLoader from '../../../components/common/RouteLoader';

const PendingOrders = ({ showFlash }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStatusFilter, setCurrentStatusFilter] = useState('All'); // ✅ New state for filter
  const [error, setError] = useState(null);

  const allStatuses = ["All","Pending", "Confirmed", "Packed", "Shipped","Out for Delivery", "Delivered", "Cancelled"];

  const fetchOrders = async (status) => { // ✅ Accept status as an argument
    const token = localStorage.getItem('token');
    if (!token) {
      showFlash('Authentication token missing.', 'error');
      setLoading(false);
      setError(null);
      return;
    }

    try {
      const url = status && status !== 'All' 
        ? `${import.meta.env.VITE_API_URL}/api/Admin/pending-orders?status=${status}`
        : `${import.meta.env.VITE_API_URL}/api/Admin/pending-orders`;
        
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          showFlash('API returned an invalid data format.', 'error');
          setOrders([]);
        }
      } else {
        showFlash(data.msg || 'Failed to fetch orders.', 'error');
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setError(true);
      showFlash('Server error. Could not fetch orders.', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentStatusFilter); // ✅ Fetch with the current filter
  }, [currentStatusFilter]); // ✅ Rerun effect when filter changes

  const handleStatusFilterChange = (status) => {
    setCurrentStatusFilter(status);
  };

  const formatOrderDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  if (loading) {
  <RouteLoader/>
    return <div className="loading-state">Loading pending orders...</div>;
  }
 if (error) {
    return (
      <ErrorPage 
        title="Failed to Load Orders" 
        message="There was an error connecting to the server. Please check your internet connection and try again."
      />
    );
  }
  return (
    <div className="pending-orders-container">
      <h2>Pending Orders</h2>
      <div className="status-filters">
        {allStatuses.map(status => (
          <button
            key={status}
            className={`status-btn ${currentStatusFilter === status ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange(status)}
          >
            {status}
          </button>
        ))}
      </div>
      <div className="orders-grid">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <h3>Order ID: {order._id.substring(0, 24)}</h3>
              <p className="user-info">
                <span className="user-name">Ordered by: {order.user?.firstName} {order.user?.lastName}</span>
                <span className="order-date">Date: {formatOrderDate(order.createdAt)}</span>
              </p>
              <p className="order-total">Total: ₹{order.grandTotal}</p>
              <div className="overall-status-badge">{order.overallStatus}</div>
            </div>
            
            <div className="order-details-body">
              <h4>Shipping Address</h4>
              <p>{order.shippingAddress?.door_no}, {order.shippingAddress?.street}, {order.shippingAddress?.city}</p>

              <h4>Dealer-wise Order Groups</h4>
              {order.dealerGroups && order.dealerGroups.map((group) => (
                <div key={group._id} className="dealer-group">
                  <div className="dealer-group-header">
                    <span>Dealer: {group.dealerId?.firstName} {group.dealerId?.lastName}</span>
                    <span className={`dealer-status status-${group.status.replace(/\s+/g, '-').toLowerCase()}`}>{group.status}</span>
                  </div>
                  
                  <ul className="item-list">
                    {group.items && group.items.map((item) => (
                      <li key={item._id} className="item">
                        <img src={item.imageUrl} alt={item.name} className="item-image" />
                        <div className="item-details">
                          <span className="item-name">{item.name}</span>
                          <span className="item-variant">({item.variant?.weight}{item.variant?.unit})</span>
                          <span className="item-quantity">Qty: {item.quantity}</span>
                          <span className="item-price">₹{item.price}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {group.delivery_pin && <p className="delivery-pin-text">PIN: {group.delivery_pin}</p>}
                  {group.cancellation_mess && <p className="cancellation-mess-text">Reason: {group.cancellation_mess}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingOrders;