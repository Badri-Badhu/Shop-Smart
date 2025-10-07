import React from 'react';
import { Link } from 'react-router-dom';
import '../css/TermsAndConditions.css'; // Reusing the same readable structure CSS

const sections = [
  { id: 'introduction', title: '1. Introduction and Scope' },
  { id: 'datacoll', title: '2. Data We Collect' },
  { id: 'datause', title: '3. How We Use Your Data' },
  { id: 'datasharing', title: '4. Data Sharing and Disclosure' },
  { id: 'security', title: '5. Data Security and Retention' },
  { id: 'rights', title: '6. Your Privacy Rights' },
  { id: 'changes', title: '7. Changes to This Policy' },
];

const PrivacyPolicy = () => {
  return (
    <div className="terms-container">
      <header className="terms-header">
        <h1>Shop Smart Privacy Policy</h1>
        <p>Last Updated: October 5, 2025</p>
      </header>

      <div className="terms-content">
        <aside className="terms-sidebar">
          <h2>Policy Contents</h2>
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
            Your trust is important to us. For privacy questions, please contact our support team.
          </p>
        </aside>

        <section className="terms-body">
          <h2 id="introduction">1. Introduction and Scope</h2>
          <p>
            This Privacy Policy explains how Shop Smart ("we," "us," or "our") collects, uses, discloses, and protects information about you when you use our website, mobile application, and related services (collectively, the "Services").
          </p>
          <p>
            By using the Services, you consent to the data practices described in this policy.
          </p>

          <h2 id="datacoll">2. Data We Collect</h2>
          <p>
            We collect information that identifies, relates to, describes, or is capable of being associated with you ("Personal Data").
          </p>
          <h3>2.1. Information You Provide Directly</h3>
          <ul>
            <li>**Account Data:** Name, email address, password, profile picture, gender, and date of birth.</li>
            <li>**Order Data:** Delivery address, phone number, payment details (processed by a third party, not stored by us), and purchase history.</li>
            <li>**Communication Data:** Feedback, product reviews, and communications with customer support.</li>
          </ul>
          <h3>2.2. Information Collected Automatically</h3>
          <ul>
            <li>**Usage Data:** Details about how you use our Services, including pages viewed, search queries, and time spent on pages.</li>
            <li>**Location Data:** General location (city/state) derived from your IP address or precise location if you grant access for delivery purposes.</li>
            <li>**Device Data:** IP address, operating system, browser type, and device identifiers.</li>
          </ul>

          <h2 id="datause">3. How We Use Your Data</h2>
          <p>
            We use your Personal Data to operate, maintain, and provide you with the features and functionality of the Services.
          </p>
          <ul>
            <li>**Fulfillment:** Processing and delivering your orders, managing payments, and providing invoices.</li>
            <li>**Personalization:** Customizing search results, providing personalized product recommendations, and displaying targeted discounts.</li>
            <li>**Communication:** Responding to your inquiries, sending order updates, and marketing communications (where consent is provided).</li>
            <li>**Improvement:** Analyzing usage data to improve our platform, search algorithms, and customer service.</li>
          </ul>

          <h2 id="datasharing">4. Data Sharing and Disclosure</h2>
          <p>
            We only share your Personal Data with third parties under limited circumstances:
          </p>
          <ul>
            <li>**Service Providers:** Sharing necessary information with delivery partners, payment processors, and cloud hosting services to fulfill your requests.</li>
            <li>**Legal Compliance:** Disclosing data when legally required by law, subpoena, or governmental request.</li>
            <li>**Business Transfers:** In the event of a merger, sale, or acquisition, your information may be transferred to the new entity.</li>
          </ul>
          <p>
            We do **not** sell your personal data to marketing companies.
          </p>

          <h2 id="security">5. Data Security and Retention</h2>
          <p>
            We implement industry-standard technical and organizational measures to protect your Personal Data from unauthorized access, disclosure, alteration, or destruction.
          </p>
          <p>
            We retain your Personal Data for as long as your account is active or as needed to provide you with the Services and comply with our legal obligations.
          </p>

          <h2 id="rights">6. Your Privacy Rights</h2>
          <p>
            Depending on your location, you may have the following rights regarding your Personal Data:
          </p>
          <ul>
            <li>**Access:** The right to request copies of your data.</li>
            <li>**Correction:** The right to request correction of inaccurate or incomplete data.</li>
            <li>**Deletion:** The right to request that we delete your personal data.</li>
          </ul>
          <p>
            You can exercise these rights by logging into your account or contacting us through our Help Center.
          </p>

          <h2 id="changes">7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date at the top.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

