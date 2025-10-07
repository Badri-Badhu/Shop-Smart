import React from 'react';
import { Link } from 'react-router-dom';
import "../css/AboutUs.css"
import Lottie from 'lottie-react';
import deliveryAnimation from '../jsons/delivery-service.json'; 

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <header className="about-us-header">
        <h1>Our Story at Shop Smart</h1>
        <p>Delivering freshness to your doorstep, powered by smart technology.</p>
      </header>

      <section className="about-us-mission">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            We founded Shop Smart with a simple goal: to make grocery shopping easy, fresh, and smart. 
            We connect you directly with local farmers and trusted suppliers, cutting out unnecessary steps 
            to ensure every product that arrives at your door is of the highest quality.
          </p>
          <p>
            We believe in transparency, sustainability, and supporting our community. Every order you place 
            helps us build a healthier, more connected food ecosystem.
          </p>
          <Link to="/home" className="cta-button">Start Shopping Now</Link>
        </div>
        <div className="mission-image">
          <Lottie 
            animationData={deliveryAnimation} 
            loop={true} 
            autoplay={true} 
            style={{ width: '100%', maxWidth: '700px' }}
          />
        </div>
      </section>

      <section className="about-us-values">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <h3>Freshness Guaranteed</h3>
            <p>We work tirelessly to ensure a cold chain is maintained from farm to fridge, ensuring peak taste and nutrition.</p>
          </div>
          <div className="value-card">
            <h3>Smart Technology</h3>
            <p>Our intelligent platform learns your preferences, providing personalized recommendations and hassle-free ordering.</p>
          </div>
          <div className="value-card">
            <h3>Community Focus</h3>
            <p>We prioritize partnerships with local businesses and focus on reducing our environmental footprint.</p>
          </div>
        </div>
      </section>

      <section className="about-us-team">
        <h2>The Team Behind Shop Smart</h2>
        <p>
          We are a dedicated group of food lovers, engineers, and customer service experts committed 
          to redefining the online grocery experience. Thank you for supporting our journey.
        </p>
      </section>
    </div>
  );
};

export default AboutUs;
