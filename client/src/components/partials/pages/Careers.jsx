import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import teamworkAnimation from '../jsons/teamwork-lottie.json'; // Replace with a teamwork or growth Lottie
import '../css/Careers.css';

const Careers = () => {
  const applicationLink = 'https://apply.shopsmart.com/jobs'; // Simulated external link

  return (
    <div className="careers-container">
      <header className="careers-header">
        <h1>Join the Shop Smart Team</h1>
        <p>Your next opportunity for growth and impact is here. Let's redefine grocery shopping together.</p>
        <div className="header-lottie">
            <Lottie 
                animationData={teamworkAnimation} 
                loop={true} 
                autoplay={true} 
                style={{ width: '100%', maxWidth: '400px' }}
            />
        </div>
      </header>

      <section className="careers-section section-corporate">
        <h2>Corporate & Tech Roles</h2>
        <p className="section-description">
          Be part of the core team building the future of e-commerce. We’re looking for innovators in software development, operations, marketing, and design.
        </p>
        <div className="role-card-grid">
          <div className="role-card">
            <h3>Software Engineer</h3>
            <p>Develop and maintain our scalable platform and intelligent search algorithms.</p>
          </div>
          <div className="role-card">
            <h3>Logistics Manager</h3>
            <p>Optimize our supply chain and distribution network for peak freshness and speed.</p>
          </div>
          <div className="role-card">
            <h3>Digital Marketing Specialist</h3>
            <p>Drive growth by connecting our smart service with more customers.</p>
          </div>
        </div>
        <a href={applicationLink} target="_blank" rel="noopener noreferrer" className="apply-link">
            See All Corporate Openings
        </a>
      </section>

      <hr className="divider" />

      <section className="careers-section section-gig">
        <h2>Gig & Partner Opportunities</h2>
        <p className="section-description">
          Gain flexibility and earn income on your schedule by joining our network of sellers and delivery partners.
        </p>
        <div className="role-card-grid two-column">
          <div className="role-card partner-card">
            <h3>Become a Seller/Dealer</h3>
            <h4>Sell your fresh produce and products directly to thousands of customers.</h4>
            <ul>
              <li>High-profit margins</li>
              <li>Control your inventory and pricing</li>
              <li>Access to a massive customer base</li>
            </ul>
            <a href="/seller-signup" className="gig-apply-link">Apply to Sell</a>
          </div>
          <div className="role-card partner-card">
            <h3>Delivery Partner</h3>
            <h4>Deliver happiness and freshness with flexible hours and competitive pay.</h4>
            <ul>
              <li>Work your own hours</li>
              <li>Weekly payouts</li>
              <li>Great incentives and support</li>
            </ul>
            <a href="/delivery-signup" className="gig-apply-link">Apply to Deliver</a>
          </div>
        </div>
      </section>

      <footer className="careers-footer">
        <p>Questions? Contact our HR team at <a href="mailto:careers@shopsmart.com">careers@shopsmart.com</a></p>
      </footer>
    </div>
  );
};

export default Careers;
