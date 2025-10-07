import React, { useState, useEffect } from 'react';
import FlashMessage from '../../../components/common/FlashMessage';
import './css/PendingOrders.css'; // You can reuse this CSS
import RouteLoader from '../../../components/common/RouteLoader';
import ErrorPage from '../../../components/Handlers/ErrorPage';

const AllOrders = ({ showFlash }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showFlash('Authentication token missing.', 'error');
      setLoading(false);
      setError(null);
      return;
    }

    try {
      // ✅ Fetch from the new "all-orders" route
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Admin/all-orders`, {
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
      setError(true);
      showFlash('Server error. Could not fetch orders.', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatOrderDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    <RouteLoader/>
  }
  if (error) {
    return (
      <ErrorPage 
        title="Failed to Load Orders" 
        message="There was an error connecting to the server. Please check your internet connection and try again."
      />
    );
  }
  if (!Array.isArray(orders) || orders.length === 0) {
    return <p className="no-orders-message">No orders found.</p>;
  }

  return (
    <div className="pending-orders-container">
      <h2>All Orders</h2>
      <div className="orders-grid">
        {orders.map((order) => {
          if (!order || !order.user || !order.shippingAddress || !order.dealerGroups) {
            console.warn('Skipping malformed order:', order);
            return null;
          }
          return (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>Order ID: {order._id.substring(0, 24)}</h3>
                <p className="user-info">
                  <span className="user-name">Ordered by: {order.user.firstName} {order.user.lastName}</span>
                  <span className="order-date">Date: {formatOrderDate(order.createdAt)}</span>
                </p>
                <p className="order-total">Total: ₹{order.grandTotal}</p>
                <div className="overall-status-badge">{order.overallStatus}</div>
              </div>
              
              <div className="order-details-body">
                <h4>Shipping Address</h4>
                <p>{order.shippingAddress.door_no}, {order.shippingAddress.street}, {order.shippingAddress.city}</p>
                <h4>Dealer-wise Order Groups</h4>
                {order.dealerGroups.map((group) => {
                  if (!group || !group.dealerId || !group.items) {
                    console.warn('Skipping malformed dealer group:', group);
                    return null;
                  }
                  return (
                    <div key={group._id} className="dealer-group">
                      <div className="dealer-group-header">
                        <span>Dealer: {group.dealerId.firstName} {group.dealerId.lastName}</span>
                        <span className={`dealer-status status-${group.status.replace(/\s+/g, '-').toLowerCase()}`}>{group.status}</span>
                      </div>
                      <ul className="item-list">
                        {group.items.map((item) => (
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
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllOrders;