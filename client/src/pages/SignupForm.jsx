import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/signup.css';
import FlashMessage from '../components/common/FlashMessage';

const SignupForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [flash, setFlash] = useState({
    show: false,
    message: '',
    type: '',
  });

  // Timer for OTP resend button
  useEffect(() => {
    let timerId;
    if (resendTimer > 0) {
      timerId = setInterval(() => {
        setResendTimer(prevTime => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendOtp = async (isResend = false) => {
    if (!formData.email) {
      setFlash({ show: true, message: "❌ Please enter a valid email.", type: "error" });
      return;
    }
    isResend ? setIsResending(true) : setIsSendingOtp(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/send-signup-otp`, {
        email: formData.email,
      });
      setOtpSent(true);
      setResendTimer(60); // Start the 60-second timer
      setFlash({ 
        show: true, 
        message: `✅ ${isResend ? 'New OTP sent!' : 'OTP sent to your email.'} Check your inbox!`, 
        type: "success" 
      });
    } catch (err) {
      console.error("OTP send error:", err.response?.data);
      setFlash({
        show: true,
        message: err.response?.data?.message || "Failed to send OTP.",
        type: "error",
      });
    } finally {
      isResend ? setIsResending(false) : setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setFlash({ show: true, message: "❌ Please enter the OTP.", type: "error" });
      return;
    }
    setIsVerifyingOtp(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-signup-otp`, {
        email: formData.email,
        otp: otp,
      });
      setEmailVerified(true);
      setFlash({ show: true, message: "✅ Email verified successfully!", type: "success" });
    } catch (err) {
      console.error("OTP verification error:", err.response?.data);
      setFlash({
        show: true,
        message: err.response?.data?.message || "Invalid OTP. Please try again.",
        type: "error",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      setFlash({ show: true, message: "❌ Please verify your email first.", type: "error" });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFlash({
        show: true,
        message: "❌ Passwords do not match.",
        type: "error",
      });
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        dob: formData.dob,
        gender: formData.gender,
      });

      setFlash({
        show: true,
        message: "✅ Signup successful!",
        type: "success",
      });

      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error("Signup error:", err.response?.data);
      setFlash({
        show: true,
        message: err.response?.data?.message || "Signup failed.",
        type: "error",
      });
    }
  };

  return (
    <div className="signup-container">
      {flash.show && (
        <FlashMessage
          message={flash.message}
          type={flash.type}
          onClose={() => setFlash({ ...flash, show: false })}
        />
      )}

      <div className="signup-box">
        <h2 className="signup-title">Create an Account</h2>
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="name-group">
            <div className="input-group">
              <input type="text" name="firstName" required placeholder=" " className="input-field" onChange={handleChange} />
              <label className="input-label">First Name</label>
            </div>
            <div className="input-group">
              <input type="text" name="lastName" required placeholder=" " className="input-field" onChange={handleChange} />
              <label className="input-label">Last Name</label>
            </div>
          </div>

          <div className="input-group email-verification-group">
            <input
              type="email"
              name="email"
              required
              placeholder=" "
              className="input-field"
              onChange={handleChange}
              disabled={emailVerified || otpSent}
            />
            <label className="input-label">Email</label>
            {!emailVerified && (
              <button
                type="button"
                className="verify-btn"
                onClick={otpSent ? handleVerifyOtp : () => handleSendOtp(false)}
                disabled={isSendingOtp || isVerifyingOtp}
              >
                {otpSent ? (isVerifyingOtp ? "Verifying..." : "Verify") : (isSendingOtp ? "Sending..." : "Send OTP")}
              </button>
            )}
            {emailVerified && <span className="verified-status">✅ Verified</span>}
          </div>

          {otpSent && !emailVerified && (
            <div className="input-group otp-input-group">
              <div className="otp-input-container">
                <input
                  type="text"
                  name="otp"
                  required
                  placeholder=" "
                  className="input-field"
                  onChange={(e) => setOtp(e.target.value)}
                />
                <label className="input-label">OTP</label>
              </div>
              <button
                type="button"
                className="resend-otp-btn"
                onClick={() => handleSendOtp(true)}
                disabled={resendTimer > 0 || isResending}
              >
                {isResending ? 'Resending...' : (resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend OTP')}
              </button>
            </div>
          )}

          <div className="input-group">
            <input type="tel" name="phone" required placeholder=" " className="input-field" onChange={handleChange} />
            <label className="input-label">Phone Number</label>
          </div>

          <div className="dob-gender-group">
            <div className="input-group">
              <input type="date" name="dob" required className="input-field" onChange={handleChange} />
              <label className="input-label small">Date of Birth</label>
            </div>
            <div className="input-group">
              <select name="gender" required className="input-field" onChange={handleChange}>
                <option hidden value=""> </option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <label className="input-label small">Gender</label>
            </div>
          </div>

          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              placeholder=" "
              className="input-field"
              onChange={handleChange}
            />
            <label className="input-label">Password</label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-button"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="input-group">
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              required
              placeholder=" "
              className="input-field"
              onChange={handleChange}
            />
            <label className="input-label">Confirm Password</label>
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="toggle-button"
            >
              {showConfirm ? 'Hide' : 'Show'}
            </button>
          </div>

          <button type="submit" className="submit-button" disabled={!emailVerified}>
            Sign Up
          </button>

          <p className="redirect-link">
            Already have an account?{' '}
            <Link to="/login-form" className="link">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
