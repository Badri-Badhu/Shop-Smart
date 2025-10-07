import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import notFoundAnimation from './not-found-404.json';
import './UniversalMessage.css';

const NotFound = ({ message }) => {
  return (
    <div className="message-container">
      <div className="lottie-animation-wrapper">
        <Lottie
          animationData={notFoundAnimation}
          loop={true}
          autoplay={true}
        />
      </div>
      <h2 className="message-title">Page Not Found</h2>
      <p className="message-text">{message || "The page you're looking for doesn't exist."}</p>
      <Link to="/" className="message-link">Go to Home</Link>
    </div>
  );
};

export default NotFound;