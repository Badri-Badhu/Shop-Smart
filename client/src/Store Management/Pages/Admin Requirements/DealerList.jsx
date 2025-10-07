import React, { useState, useEffect } from 'react';
import FlashMessage from '../../../components/common/FlashMessage';
import "./css/DealerList.css"
const DealerList = ({ showFlash }) => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDealers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showFlash('Authentication token missing.', 'error');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Admin/dealers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setDealers(data);
      } else {
        showFlash(data.msg || 'Failed to fetch dealers.', 'error');
      }
    } catch (err) {
      console.error(err);
      showFlash('Server error. Could not fetch dealers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  if (loading) {
    return <div className="loading-state">Loading dealer list...</div>;
  }

  return (
    <div className="dealer-list-container">
      <h2>Registered Dealers</h2>
      {dealers.length === 0 ? (
        <p className="no-dealers">No dealers found.</p>
      ) : (
        <div className="dealers-grid">
          {dealers.map((dealer) => (
            <div key={dealer._id} className="dealer-card">
              <div className="dealer-info">
                <h3>{dealer.firstName} {dealer.lastName}</h3>
                <p>📧 <strong>Email:</strong> {dealer.email}</p>
                <p>📞 <strong>Phone:</strong> {dealer.phone}</p>
              </div>
              <div className="order-stats">
                <div className="stat-item pending">
                  <span className="stat-label">Pending</span>
                  <span className="stat-value">{dealer.pendingOrders}</span>
                </div>
                <div className="stat-item shipped">
                  <span className="stat-label">Shipped</span>
                  <span className="stat-value">{dealer.shippedOrders}</span>
                </div>
                <div className="stat-item delivered">
                  <span className="stat-label">Delivered</span>
                  <span className="stat-value">{dealer.deliveredOrders}</span>
                </div>
                <div className="stat-item cancelled">
                  <span className="stat-label">Cancelled</span>
                  <span className="stat-value">{dealer.cancelledOrders}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DealerList;