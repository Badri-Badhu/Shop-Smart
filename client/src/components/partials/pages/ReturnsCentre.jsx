import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import returnBoxAnimation from '../jsons/return-box-lottie.json'; // Replace with a returns/customer service Lottie
import '../css/ReturnsCentre.css';

const supportEmail = 'darllingbadhu@gmail.com';

const ReturnsCentre = () => {
  return (
    <div className="returns-container">
      <header className="returns-header">
        <h1>Shop Smart Returns Centre</h1>
        <p>Our goal is to ensure you are 100% satisfied. Here’s how we handle returns.</p>
      </header>

      <section className="returns-guide-section">
        <div className="returns-lottie-wrapper">
          <Lottie 
            animationData={returnBoxAnimation} 
            loop={true} 
            autoplay={true} 
            style={{ width: '100%', maxWidth: '350px' }}
          />
        </div>
        <div className="returns-guide-content">
          <h2>How to Initiate a Return</h2>
          <ol>
            <li>
              <strong>Check Eligibility:</strong> Review the policy below to confirm your item qualifies for a return/refund.
            </li>
            <li>
              <strong>Send an Email:</strong> Email us immediately at <a href={`mailto:${supportEmail}`}>{supportEmail}</a> with your **Order ID**, the **Item Name**, and a **detailed description** of the issue (e.g., spoilage, damage, expired).
            </li>
            <li>
            <strong>Attach Proof:</strong> For spoiled or damaged goods, please attach **clear photos or a short video** showing the issue.
            </li>
            <li>
              <strong>Next Steps:</strong> Our support team will review the issue and, if necessary, connect you directly with the seller/dealer to fix the problem quickly (replacement, refund, or credit).
            </li>
          </ol>
          <Link to="/order-history" className="cta-returns-button">View Order History</Link>
        </div>
      </section>

      <hr className="divider" />

      <section className="returns-policies">
        <h2>Our Return Policies</h2>
        
        <div className="policy-group perishable">
          <h3>Spoiled, Damaged, or Expired Goods (Perishables)</h3>
          <p className="policy-summary">
            **Critical 48-Hour Window:** Due to the nature of fresh goods (Fruits, Vegetables, Dairy, Bakery), you must report the issue within **48 hours of delivery**.
          </p>
          <ul>
            <li><strong>Spoiled Goods:</strong> If an item is spoiled or unusable upon arrival, we offer a full refund or replacement. Proof (photo/video) is mandatory.</li>
            <li><strong>Expired Items:</strong> If an item is delivered past its listed expiration date, it qualifies for an immediate full refund.</li>
            <li>**Incorrect Weight/Variant:** If the received weight or variant is incorrect, we will adjust the billing or offer a credit.</li>
          </ul>
        </div>

        <div className="policy-group general">
          <h3>Sealed/Non-Perishable Goods</h3>
          <p className="policy-summary">
            Non-perishable items (Household, Canned Goods, Packaged Snacks) can be returned within **7 days of delivery** if they are unopened and unused.
          </p>
          <ul>
            <li>Items must be returned in their original packaging.</li>
            <li>Refunds will be processed once the item is received and inspected by the seller.</li>
          </ul>
        </div>
      </section>

      <footer className="returns-footer">
        <p>If you have not heard from us within 24 hours of emailing, please call our support line.</p>
      </footer>
    </div>
  );
};

export default ReturnsCentre;
