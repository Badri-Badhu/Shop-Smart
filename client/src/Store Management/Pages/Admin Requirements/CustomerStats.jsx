import React, { useState, useEffect } from 'react';
import FlashMessage from '../../../components/common/FlashMessage';
import "./css/CustomerStats.css"; 
import { Route } from 'react-router-dom';
import RouteLoader from '../../../components/common/RouteLoader';

const CustomerStats = ({ showFlash }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 const fetchCustomers = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    showFlash('Authentication token missing.', 'error');
    setLoading(false);
    setError(null);
    return;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Admin/customers`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      // ✅ Check if the data is a valid array before setting it to state
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        // If the data is not an array, handle it gracefully
        showFlash('API returned invalid data format.', 'error');
        setCustomers([]); // Set to an empty array to prevent a crash
      }
    } else {
      const errorText = await res.text();
      let errorMessage = 'Failed to fetch customer data.';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.msg || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      showFlash(errorMessage, 'error');
      setCustomers([]); // Ensure state is an empty array on error
    }
  } catch (err) {
    console.error(err);
    setError(true);
    showFlash('Server error. Could not fetch customer data.', 'error');
    setCustomers([]); // Ensure state is an empty array on network error
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchCustomers();
  }, []);

  // Format the date to 12-hour format
  const formatJoinDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    <RouteLoader/>
    return <div className="loading-state">Loading customer data...</div>;
  }
  if (error) {
    return (
      <ErrorPage 
        title="Failed to Load Customers data" 
        message="There was an error connecting to the server. Please check your internet connection and try again."
      />
    );
  }

  return (
    <div className="customer-stats-container">
      <h2>Customer Statistics</h2>
      {customers.length === 0 ? (
        <p className="no-customers">No customer data found.</p>
      ) : (
        <div className="customer-grid">
          {customers.map((customer) => (
            <div key={customer._id} className="customer-card">
              <h3>{customer.firstName} {customer.lastName}</h3>
              <p>📧 <strong>Email:</strong> {customer.email}</p>
              <p>📞 <strong>Phone:</strong> {customer.phone}</p>
              <p>📦 <strong>Total Orders:</strong> {customer.orderCount}</p>
              <p>📅 <strong>Joined:</strong> {formatJoinDate(customer.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerStats;