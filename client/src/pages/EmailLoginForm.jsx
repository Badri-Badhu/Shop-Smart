import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/emaillogin.css";

const EmailLoginForm = ({ showFlash }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastEmailSent, setLastEmailSent] = useState("");

  const navigate = useNavigate();

  // ⏱ Reset OTP if email is changed after sending
  useEffect(() => {
    if (otpSent && email !== lastEmailSent) {
      setOtpSent(false);
      setOtp("");
      setCooldown(0);
    }
  }, [email, lastEmailSent, otpSent]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (!email.includes("@")) {
      showFlash("Please enter a valid email address.", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/send-email-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      setLoading(false);

      if (!response.ok) throw new Error(data.message);

      setOtpSent(true);
      setLastEmailSent(email);
      setCooldown(30); // Start 30s timer
      showFlash(data.message || "OTP sent to your email.", "success");
    } catch (err) {
      console.error("OTP send error:", err);
      setLoading(false);
      showFlash(err.message || "Failed to send OTP", "error");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-email-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      showFlash("✅ Logged in successfully!", "success");
      navigate("/home");
    } catch (err) {
      console.error("OTP verify error:", err);
      showFlash(err.message || "OTP verification failed", "error");
    }
  };

  return (
    <div className="phone-wrapper">
      <div className="phone-box">
        <h2 className="phone-heading">Login with Email</h2>

        <form className="phone-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="input-field"
              required
            />
            <label className="input-label">Email Address</label>
          </div>

          {otpSent && (
            <div className="input-group">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder=" "
                className="input-field"
                required
              />
              <label className="input-label">Enter OTP</label>
            </div>
          )}

          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              className="send-button"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <>
              <button type="button" onClick={handleVerifyOtp} className="verify-button">
                Verify OTP
              </button>

              {cooldown > 0 ? (
                <p className="flash-message" style={{ color: "#888", marginTop: "10px" }}>
                  Resend OTP in {cooldown}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="send-button"
                  style={{ marginTop: "10px", backgroundColor: "#4a4a4a" }}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmailLoginForm;
