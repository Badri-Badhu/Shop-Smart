import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './Pofilescss/profile.css';
import maleIcon from '../../assets/profile-male.png';
import femaleIcon from '../../assets/profile-female.png';
import defaultIcon from '../../assets/profile-default.png';
import ForgotPasswordPopup from '../../components/common/ForgotPasswordPopup';
import FlashMessage from '../../components/common/FlashMessage';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [showActivities, setShowActivities] = useState(false);
  const [authType, setAuthType] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // ✅ NEW: State for popups and conditions
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [flash, setFlash] = useState({ message: "", type: "" });

  const showFlash = (message, type) => {
    setFlash({ message, type });
  };
  
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedAuthType = localStorage.getItem("authType");
    if (storedUser) {
      setUserData(storedUser);
    }
    if (storedAuthType) {
      setAuthType(storedAuthType);
    }
  }, []);

  if (!userData) {
    return <div className="loading-state">Loading profile...</div>;
  }

  const {
    firstName, lastName, email, phone, role, gender, dob, addresses, createdAt
  } = userData;

  const getProfileImage = () => {
    if (gender === 'Male') return maleIcon;
    if (gender === 'Female') return femaleIcon;
    return defaultIcon;
  };

  const toggleActivities = () => {
    setShowActivities(prev => !prev);
  };
  
  // ✅ NEW: Event handlers for popups
  const handleApplyDealerClick = () => {
    setShowConfirmationPopup(true);
  };

  const handleCancelClick = () => {
    setShowConfirmationPopup(false);
    setTermsAgreed(false); // Reset the agreement state
  };

  const handleTermsLinkClick = (e) => {
    e.preventDefault(); // Prevents the link from navigating
    setShowTermsPopup(true);
  };

  const handleTermsAgreeClick = () => {
    setTermsAgreed(true);
    setShowTermsPopup(false);
  };
  
  const handleTermsCloseClick = () => {
    setShowTermsPopup(false);
  };

const handleSubmitClick = async () => {
  console.log("Applying to be a dealer...");
  
  try {
    const userId = userData._id; 
    const token = localStorage.getItem('token'); 

    const url = `${import.meta.env.VITE_API_URL}/api/user/dealer-application`;

    const res = await fetch(url, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    // The rest of the logic remains the same
    if (res.ok) {
      const data = await res.json();
      console.log("Application successful:", data.msg);
      setShowConfirmationPopup(false);
      showFlash(data.msg, "success");
    } else {
      const errorData = await res.json(); // Assumes the server sends back JSON on error
      console.error("Application failed:", errorData.msg);
      setShowConfirmationPopup(false);
      showFlash(errorData.msg, "error");
    }
  } catch (err) {
    console.error("Network error:", err);
    setShowConfirmationPopup(false);
    showFlash("An error occurred. Please try again.", "error");
  }
};

  return (
    <div className="dashboard-layout">
      {flash.message && (
        <FlashMessage
          message={flash.message}
          type={flash.type}
          onClose={() => setFlash({ message: "", type: "" })}
        />
      )}
      <div className="dashboard-main-card">
        {/* Left Side */}
        <div className="left-panel">
          <div className="profile-header">
            <img src={getProfileImage()} alt="Profile" className="profile-image" />
            <h1 className="profile-name">{firstName} {lastName}</h1>
            <p className="profile-role">Role: {role}</p>
            <Link to="/edit-profile#editor" className="edit-profile-btn">Edit Profile</Link>
          </div>

          <div className="profile-details-grid">
            <div className="detail-card">
              <h4>Contact Info</h4>
              <p>📧 Email : {email}</p>
              <p>📞 Phone : {phone}</p>
            </div>
            <div className="detail-card">
              <h4>Personal Details</h4>
              <p>📅 D.O.B : {dob ? new Date(dob).toLocaleDateString() : "Not set"}</p>
              <p>🚻 Gender : {gender}</p>
              <p>✨ Created At: {new Date(createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {role === 'user' && (
          <div className="profile-addresses detail-card">
            <h3>Addresses</h3>
            {addresses && addresses.slice(0,2).map((addr, index) => (
              <div key={index} className="address-card">
                <p><button className="type-addre">{addr.type}</button></p>
                <p>To : {addr.to}</p>
                <p>Door-No : {addr.door_no}</p>
                <p>Street : {addr.street}</p>
                <p>City : {addr.city}</p>
                <p>State : {addr.state}</p>
                <p>Postal-Code : {addr.postalCode}</p>
                <p>Alt-Num : {addr.alt_no}</p>
              </div>
            ))}
            <Link to="/edit-profile#addreser" className="add-address-btn-prof">+ Add New Address</Link>
          </div>)}
        </div>
          
        {/* Right Side */}
        <div className="right-panel">
          {(role === 'dealer' || role === 'admin') && (
            <div className="role-specific-features">
              <Link to="/product-manager-dashboard" className="feature-btn">Manage Products</Link>
            </div>
          )}

          {role === 'admin' && (
            <div className="admin-features">
              <h3>Admin Dashboard</h3>
              <Link to="/admin-dashboard" className="admin-btn">Admin Dashboard</Link>
            </div>
          )}

          {role === 'user' && (
            <div className="dashboard-card">
              <h3>Order History</h3>
              <Link to="/order-history" className="dashboard-btn add-address-btn-prof">View All Orders</Link>
            </div>
          )}

    {role !== 'admin' && (
          <div disabled className="dashboard-card">
            <h3>Help Center</h3>
            <p style={{ textAlign: "center" }}>Find answers to common questions. Coming soon</p>
            <button disabled className="dashboard-btn">Visit Help Center</button>
          </div>
      )}
          <div className="dashboard-card">
          <p style={{ textAlign: "center" ,fontWeight:"bold",fontSize:"large" }}>Coming soon</p>
            <button onClick={toggleActivities} className="dashboard-btn dropdown-toggle">
              My Activities {showActivities ? '▲' : '▼'}
            </button>
            {showActivities && (
              <div className="dropdown-menu">
                <button className="dropdown-item">My Reviews</button>
                <button className="dropdown-item">My Wishlist</button>
              </div>
            )}
          </div>

          {role === 'user' && (
            <div className="dashboard-card apply-dealer-section">
              <h3>Become a Dealer</h3>
              <p style={{textAlign:"center"}}>Want to sell your products? Apply now!</p>
              <button 
                className="dashboard-btn apply-dealer-btn"
                onClick={handleApplyDealerClick}
              >
                Apply for Dealer
              </button>
            </div>
          )}

          {role === 'admin' && (
            <div className="dashboard-card admin-notifications">
              <h3>Admin Notifications</h3>
              <Link to="/admin-dashboard?tab=requests" className="dashboard-btn notification-btn">
                Dealer Applications
              </Link>
            </div>
          )}

          {!authType && (
            <div className="forgot-password-section">
              <button className="forgot-password-btn" onClick={() => setShowForgotPassword(true)}>Forgot Password?</button>
            </div>
          )}
        </div>
      </div>
      {showForgotPassword && (
        <ForgotPasswordPopup 
          onClose={() => setShowForgotPassword(false)} 
          showFlash={showFlash} 
        />
      )}

      {/* ✅ NEW: Confirmation Popup as a React component */}
        {showConfirmationPopup && (
      <div id="confirmation-popup" className="prof-popup-overlay">
        <div className="prof-popup-content">
          <h3>Confirm to Become a Dealer</h3>
          <p  style={{textAlign:"center"}}>Please review and agree to the terms below.</p>
          <div  className="prof-terms-container">
            <input 
              type="checkbox" 
              id="terms-checkbox" 
              checked={termsAgreed}
              onChange={() => {}}
            />
            <label htmlFor="terms-checkbox" >
              I agree to the <a href="#" onClick={handleTermsLinkClick}>terms and conditions</a>.
            </label>
          </div>
          <div className="prof-popup-actions">
            <button className="prof-btn prof-cancel-btn" onClick={handleCancelClick}>
              Cancel
            </button>
            <button 
              className={`prof-btn ${termsAgreed ? '' : 'hidden'}`}
              onClick={handleSubmitClick}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    )}

    {showTermsPopup && (
      <div id="terms-popup" className="prof-popup-overlay">
        <div className="prof-popup-content">
          <div className="prof-popup-header">
            <h3>Terms and Conditions</h3>
            <button className="prof-close-btn" onClick={handleTermsCloseClick}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="prof-terms-text">
            <p>
              <strong>Condition 1: Loss of User Functionalities</strong>
              <br />
              On agreeing, you will lose the functionalities of a regular user and
              will be granted dealer-specific features.
            </p>
            <p>
              <strong>Condition 2: Delivery Responsibility</strong>
              <br />
              There is currently no delivery partner, so it is your sole responsibility
              to deliver the orders to the customers.
            </p>
            <p>
              <strong>Condition 3: Shop Details </strong>
              <br />
              Soon we are going to enable the form to submit the <mark>Shop Details</mark> to the <b>Admin</b> team
              for the verification.
            </p>
          </div>
          <div className="prof-popup-actions">
            <button className="prof-btn" onClick={handleTermsAgreeClick}>
              Agree
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default UserProfile;