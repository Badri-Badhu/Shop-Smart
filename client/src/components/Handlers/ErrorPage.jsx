import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import errorAnimation from './server-error.json';
import './ErrorPage.css';

const ErrorPage = ({ title, message }) => {
  return (
    <div className="message-container">
      <div className="err-lottie-animation-wrapper">
        <Lottie
          animationData={errorAnimation}
          loop={false}
          autoplay={true}
        />
      </div>
      <div className="text-content-wrapper">
        <h2 className="message-title">{title || "An Unexpected Error Occurred"}</h2>
        <p className="message-text">{message || "Something went wrong. Please try again later."}</p>
        <Link to="/" className="message-link">Go to Home</Link>
      </div>
    </div>
  );
};

export default ErrorPage;