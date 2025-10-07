import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import writingAnimation from '../jsons/writing-lottie.json'; // Replace with an appropriate Lottie
import '../css/Blog.css';

const mockArticles = [
  { id: 1, title: "Our Promise: Hitting the Delivery Window Every Time", snippet: "Learn about the logistics magic and smart routing that keeps your delivery punctual.", category: "Logistics", date: "Oct 1, 2025" },
  { id: 2, title: "Meet Farmer Joe: The Secret Behind Our Fresh Mangoes", snippet: "A spotlight on our trusted dealer network and their commitment to quality.", category: "Dealers", date: "Sep 25, 2025" },
  { id: 3, title: "5 Quick & Easy Dinners Using Seasonal Vegetables", snippet: "Simple, nutritious recipe ideas based on what's fresh this week.", category: "Recipes", date: "Sep 18, 2025" },
  { id: 4, title: "Decoding the Cart: How Our Smart Search Works", snippet: "A behind-the-scenes look at the tech that powers your shopping experience.", category: "Technology", date: "Sep 10, 2025" },
];

const Blog = () => {
  return (
    <div className="blog-container">
      
      <header className="blog-header-banner">
        <div className="banner-content">
          <h1>Shop Smart Insights</h1>
          <p>Fresh ideas, smart solutions, and the latest news from our team.</p>
        </div>
        <div className="banner-lottie">
          <Lottie 
            animationData={writingAnimation} 
            loop={true} 
            autoplay={true} 
            style={{ width: '100%', maxWidth: '600px' }}
          />
        </div>
      </header>

      <section className="blog-posts-section">
        <h2>Latest Articles</h2>
        <div className="article-grid">
          {mockArticles.map(article => (
            <Link to={`/blog/${article.id}`} key={article.id} className="article-card">
              <div className="card-tag">{article.category}</div>
              <h3>{article.title}</h3>
              <p>{article.snippet}</p>
              <div className="card-footer">
                <span>Read More</span>
                <span className="article-date">{article.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="subscribe-section">
        <h2>Stay Updated</h2>
        <p>Subscribe to our newsletter for exclusive tips and early access to deals.</p>
        {/* Placeholder for a subscription form */}
        <div className="subscribe-form">
          <input type="email" placeholder="Enter your email address" />
          <button>Subscribe</button>
        </div>
      </section>
      
    </div>
  );
};

export default Blog;
