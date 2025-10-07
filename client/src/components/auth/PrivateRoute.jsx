import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import FlashMessage from '../common/FlashMessage';
import RouteLoader from '../common/RouteLoader';

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking
  const [showFlash, setShowFlash] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setShowFlash(true);
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [navigate]);

  // 1️⃣ While checking authentication, show loader
  if (isAuthenticated === null) {
    return <RouteLoader />;
  }

  // 2️⃣ If authenticated, render the protected route
  if (isAuthenticated) {
    return <Outlet />;
  }

  // 3️⃣ If not authenticated, show flash + loader/redirect
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {showFlash && (
        <FlashMessage
          message="You must be logged in to view this page. Redirecting..."
          type="error"
        />
      )}
      {/* Optional: show loader here too while waiting for redirect */}
      <div style={{ marginTop: '20px' }}>
        <RouteLoader />
      </div>
    </div>
  );
};

export default PrivateRoute;
