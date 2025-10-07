import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/sociallogin.css';
import otplogo from '../assets/otplogo.png';

const SocialLogin = ({ showFlash }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isSignupPage = location.pathname === '/signup';

  const handleContinue = () => {
    if (location.pathname === '/login') {
      navigate('/login-form');
    } else if (location.pathname === '/signup') {
      navigate('/signup-form');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  const handleOtpLogin = () => {
    navigate('/login/email-otp');
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const message = params.get('message');
    const type = params.get('type');

    if (message && type && showFlash) {
      showFlash(decodeURIComponent(message), type);
    }
  }, [location.search, showFlash]);

  return (
    <div className="social-container">
      <div className="social-box">
        <h2 className="social-title">
          {isSignupPage ? 'Sign up for Shop Smart' : 'Login to Shop Smart'}
        </h2>

        <div className="social-buttons">
          {/* Google Login */}
          <button className="social-btn" onClick={handleGoogleLogin}>
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="icon"
            />
            Continue with Google
          </button>

          {/* ✅ OTP Login only shown on login page */}
          {!isSignupPage && (
            <button className="social-btn" onClick={handleOtpLogin}>
              <img
                src={otplogo}
                alt="OTP"
                className="icon"
              />
              Continue with OTP
            </button>
          )}

          <div className="separator">
            <div className="line" />
            <span className="or-text">or</span>
            <div className="line" />
          </div>

          <button className="email-btn" onClick={handleContinue}>
            Continue with Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialLogin;
