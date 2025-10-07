import React from 'react';
import { Link } from 'react-router-dom';
import '../css/TermsAndConditions.css';

const sections = [
  { id: 'introduction', title: '1. Introduction and Agreement' },
  { id: 'eligibility', title: '2. Eligibility and Account' },
  { id: 'ordering', title: '3. Ordering and Payment' },
  { id: 'delivery', title: '4. Delivery and Risk' },
  { id: 'returns', title: '5. Returns and Refunds' },
  { id: 'userconduct', title: '6. User Conduct and Content' },
  { id: 'disclaimer', title: '7. Disclaimers and Liability' },
];

const TermsAndConditions = () => {
  return (
    <div className="terms-container">
      <header className="terms-header">
        <h1>Terms and Conditions of Use</h1>
        <p>Last Updated: October 5, 2025</p>
      </header>

      <div className="terms-content">
        <aside className="terms-sidebar">
          <h2>Table of Contents</h2>
          <nav>
            <ul>
              {sections.map(section => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="contact-note">
            For questions about these terms, please visit our <Link to="/help">Help Center</Link>.
          </p>
        </aside>

        <section className="terms-body">
          <h2 id="introduction">1. Introduction and Agreement</h2>
          <p>
            Welcome to Shop Smart! These Terms and Conditions ("Terms") govern your use of the Shop Smart website, mobile applications, and services ("Services"). By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part of the terms, you must not use the Services.
          </p>
          <p>
            Shop Smart reserves the right to update or change these Terms at any time. Your continued use of the Services after any such change constitutes your acceptance of the new Terms.
          </p>

          <h2 id="eligibility">2. Eligibility and Account</h2>
          <p>
            To use our Services, you must be at least 18 years of age and legally capable of entering into binding contracts. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.
          </p>
          <p>
            You agree to accept responsibility for all activities that occur under your account or password. We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion.
          </p>

          <h2 id="ordering">3. Ordering and Payment</h2>
          <p>
            All products listed on the Services are subject to availability. By placing an order, you warrant that all information provided is accurate and complete, and that you are authorized to use the payment method provided.
          </p>
          <p>
            Shop Smart processes payments through secure third-party payment processors. We are not responsible for errors in payment processing. All prices are inclusive of applicable taxes unless otherwise stated.
          </p>

          <h2 id="delivery">4. Delivery and Risk</h2>
          <p>
            We will make every effort to deliver your order within the estimated delivery time. However, time for delivery shall not be of the essence, and Shop Smart shall not be liable for any losses due to delays.
          </p>
          <ul>
            <li>**Freshness:** We guarantee that all fresh produce will be of merchantable quality upon delivery.</li>
            <li>**Risk:** Risk of loss and title for items purchased pass to you upon our delivery to the carrier or to the designated delivery address.</li>
          </ul>

          <h2 id="returns">5. Returns and Refunds</h2>
          <p>
            Our Returns Centre provides detailed information on how to return items. Generally, we accept returns for defective, damaged, or incorrect products within 48 hours of delivery.
          </p>
          <p>
            Perishable goods (fresh fruits, vegetables, dairy) are subject to a limited, case-by-case review for refunds, prioritizing hygiene and safety standards. Refunds are typically processed within 7-10 business days.
          </p>
          <p>
            For more details, please see our dedicated <Link to="/returns-centre">Returns Centre</Link> page.
          </p>

          <h2 id="userconduct">6. User Conduct and Content</h2>
          <p>
            You agree not to use the Services for any unlawful purpose. Any review, comment, or content submitted by you must not be false, misleading, defamatory, or infringe upon any third party's rights.
          </p>
          <p>
            Shop Smart has the right, but not the obligation, to monitor and edit or remove any content submitted by users.
          </p>

          <h2 id="disclaimer">7. Disclaimers and Liability</h2>
          <p>
            The Services are provided on an "as is" and "as available" basis. Shop Smart makes no representations or warranties of any kind, express or implied, as to the operation of the Services or the information, content, materials, or products included on the Services.
          </p>
          <p>
            To the full extent permissible by applicable law, Shop Smart disclaims all warranties, express or implied. Shop Smart will not be liable for any damages of any kind arising from the use of the Services.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
