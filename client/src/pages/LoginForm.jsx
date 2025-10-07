import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/login.css';

const LoginForm = ({ showFlash }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {};
      if (formData.emailOrPhone.includes('@')) {
        payload.email = formData.emailOrPhone;
      } else {
        payload.phone = formData.emailOrPhone;
      }
      payload.password = formData.password;

      // console.log("🚀 Submitting payload:", payload);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        payload
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Global flash message
      showFlash("✅ Login successful!", "success");

      setTimeout(() => navigate("/home"), 1000);
    } catch (err) {
      console.error("❌ Login error:", err.response?.data);

      showFlash(err.response?.data?.message || "❌ Login failed.", "error");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2 className="login-heading">Welcome Back</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="emailOrPhone"
              required
              placeholder=" "
              value={formData.emailOrPhone}
              className="input-field"
              onChange={handleChange}
            />
            <label className="input-label">Email or Phone</label>
          </div>
          <div className="form-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              placeholder=" "
              value={formData.password}
              className="input-field password"
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
          <button type="submit" className="submit-button">Login</button>
          <p className="switch-link">
            Don't have an account? <Link to="/signup-form" className="link">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
