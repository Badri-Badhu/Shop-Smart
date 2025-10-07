import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ForgotPasswordPopup.css';

const ForgotPasswordPopup = ({ onClose, showFlash }) => {
  const [flow, setFlow] = useState('options');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.email) {
        setEmail(user.email);
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
    }
  }, []);

  // Timer for OTP resend
  useEffect(() => {
    let timer;
    if (otpSent && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, resendTimer]);

  const handleSendOtp = async () => {
    if (!email) {
      showFlash("Please enter a valid email.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/send-password-reset-otp`, { email });
      setOtpSent(true);
      setResendTimer(60); // Set timer to 60 seconds
      showFlash("OTP sent to your email. Please check your inbox.", "success");
    } catch (err) {
      showFlash(err.response?.data?.message || "Error sending OTP.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeWithOtp = async () => {
    if (!email || !otp || !newPassword || newPassword !== confirmPassword) {
      showFlash("Please fill in all fields correctly.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password-otp`, {
        email,
        otp,
        newPassword
      });
      if (res.data.success) {
        showFlash("Password changed successfully! 🎉", "success");
        setTimeout(onClose, 2000);
      } else {
        showFlash("Invalid OTP or error changing password.", "error");
      }
    } catch (err) {
      showFlash(err.response?.data?.message || "Error changing password.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeWithOldPassword = async () => {
    if (!oldPassword || !newPassword || newPassword !== confirmPassword) {
      showFlash("Please fill in all fields correctly.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showFlash("You must be logged in to change your password.", "error");
        setIsSubmitting(false);
        return;
      }
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
        oldPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showFlash("Password changed successfully! ✅", "success");
        setTimeout(onClose, 2000);
      } else {
        showFlash("Invalid old password or error changing password.", "error");
      }
    } catch (err) {
      showFlash(err.response?.data?.message || "Error changing password.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (flow === 'options') {
      return (
        <div className="flow-options">
          <p>How would you like to reset your password?</p>
          <button className="flow-btn" onClick={() => setFlow('otp')}>
            Change with OTP
          </button>
          <button className="flow-btn" onClick={() => setFlow('old-password')}>
            Change with Old Password
          </button>
        </div>
      );
    } else if (flow === 'otp') {
      return (
        <div className="flow-otp">
          <h3>Change with OTP</h3>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={otpSent} />
            <button 
                className="otp-btn" 
                onClick={handleSendOtp} 
                disabled={isSubmitting || (otpSent && resendTimer > 0)}
            >
              {isSubmitting ? "Sending..." : (otpSent ? `Resend OTP (${resendTimer}s)` : "Send OTP")}
            </button>
          </div>
          {otpSent && (
            <>
              <div className="form-group">
                <label>Enter OTP</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
              </div>
              <div className="form-group password-field">
                <label>New Password</label>
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowNewPassword(prev => !prev)} className="toggle-password-btn">
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="form-group password-field">
                <label>Confirm New Password</label>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
                <button type="button" onClick={() => setShowConfirmPassword(prev => !prev)} className="toggle-password-btn">
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <button className="submit-btn" onClick={handleChangeWithOtp} disabled={isSubmitting}>
                {isSubmitting ? "Changing..." : "Change Password"}
              </button>
            </>
          )}
        </div>
      );
    } else if (flow === 'old-password') {
      return (
        <div className="flow-old-password">
          <h3>Change with Old Password</h3>
          <div className="form-group password-field">
            <label>Old Password</label>
            <input 
              type={showOldPassword ? "text" : "password"} 
              value={oldPassword} 
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowOldPassword(prev => !prev)} className="toggle-password-btn">
              {showOldPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="form-group password-field">
            <label>New Password</label>
            <input 
              type={showNewPassword ? "text" : "password"} 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowNewPassword(prev => !prev)} className="toggle-password-btn">
              {showNewPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="form-group password-field">
            <label>Confirm New Password</label>
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
            <button type="button" onClick={() => setShowConfirmPassword(prev => !prev)} className="toggle-password-btn">
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <button className="submit-btn" onClick={handleChangeWithOldPassword} disabled={isSubmitting}>
            {isSubmitting ? "Changing..." : "Change Password"}
          </button>
        </div>
      );
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="popup-close-btn" onClick={onClose}>
          ×
        </button>
        <h2>Forgot Password</h2>
        {renderContent()}
        {flow !== 'options' && (
          <button className="back-btn" onClick={() => setFlow('options')}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPopup;