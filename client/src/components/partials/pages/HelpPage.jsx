import React, { useState } from 'react';
import Accordion from './Accordion';
import Lottie from 'lottie-react';
import supportAnimation from '../jsons/customer-support-lottie.json'; // Replace with a support/FAQ Lottie
import '../css/HelpPage.css';

const FAQ_DATA = [
  { id: 1, category: "Orders & Delivery", question: "How can I track my order?", answer: "You can track your order status in real-time by visiting the 'Order History' section in your account dashboard. A tracking link is also sent to your email once the order is dispatched." },
  { id: 2, category: "Orders & Delivery", question: "What is the typical delivery time?", answer: "Our standard delivery window is 2-4 hours from the time the order is placed. Exact delivery slots are confirmed during checkout." },
  { id: 3, category: "Payments & Billing", question: "What payment methods do you accept?", answer: "We accept all major credit/debit cards (Visa, Mastercard, Amex), UPI payments, and Cash on Delivery (COD) for selected locations." },
  { id: 4, category: "Returns & Refunds", question: "How do I return a spoiled or damaged product?", answer: `For spoiled or damaged goods, you must email us at ${'darllingbadhu@gmail.com'} within 48 hours of delivery. Please include your Order ID and clear photos of the damaged item. We will then connect you with the seller for resolution.` },
  { id: 5, category: "Returns & Refunds", question: "How long does a refund take?", answer: "Once a refund is approved, it is processed immediately. It typically takes 5-10 business days for the credit to appear in your bank statement, depending on your bank." },
  { id: 6, category: "Account & Profile", question: "How do I update my delivery address?", answer: "You can update your primary delivery address by visiting the 'Edit Profile' page in your account settings. You can also add a new address during the checkout process." },
  { id: 7, category: "Technical Support", question: "I am having trouble logging in. What should I do?", answer: "Please use the 'Forgot Password' link on the login page. If the issue persists, please clear your browser cache or try a different browser." },
];

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Orders & Delivery', 'Payments & Billing', 'Returns & Refunds', 'Account & Profile', 'Technical Support'];

  const filteredFaqs = FAQ_DATA.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="help-page-container">
      
      <header className="help-header">
        <div className="header-content">
          <h1>How Can We Help You?</h1>
          <p>Find quick answers to your questions, or contact our support team.</p>
        </div>
        <div className="header-lottie-wrapper">
          <Lottie 
            animationData={supportAnimation} 
            loop={false} 
            autoplay={true} 
            style={{ width: '100%', maxWidth: '200px' }}
          />
        </div>
      </header>

      <div className="search-bar-wrapper">
        <input
          type="text"
          placeholder="Search for answers (e.g., 'delivery time', 'refund')"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="faq-search-input"
        />
      </div>

      <div className="category-filter-bar">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="faq-list-section">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map(faq => (
            <Accordion 
              key={faq.id} 
              title={faq.question} 
              content={faq.answer} 
            />
          ))
        ) : (
          <div className="no-results">
            <p>No results found for your query. Please try searching for a different term or:</p>
            <a href={`mailto:${'darllingbadhu@gmail.com'}`} className="contact-link">Email Support Directly</a>
          </div>
        )}
      </section>

      <footer className="help-footer">
        <p>Still need help? Our customer support is ready to assist you.</p>
      </footer>
    </div>
  );
};

export default HelpPage;
