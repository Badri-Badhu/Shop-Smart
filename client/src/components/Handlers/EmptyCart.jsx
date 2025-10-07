import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import emptyCartAnimation from './empty-cart-box.json'; // Make sure to use your own Lottie JSON path
import './EmptyCart.css';

const EmptyCart = () => {
  return (
    <div className="empty-cart-container">
      <div className="empty-cart-lottie">
        <Lottie 
          animationData={emptyCartAnimation}
          loop={true}
          autoplay={true}
        />
      </div>
      <p className="empty-cart-message-top">Hey, it feels so light!</p>
      <p className="empty-cart-message-bottom">There is nothing in your cart, let's add some items.</p>
      <Link to="/home" className="empty-cart-shop-link">Start Shopping</Link>
    </div>
  );
};

export default EmptyCart;