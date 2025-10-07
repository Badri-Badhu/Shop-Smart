import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLottie } from 'lottie-react';
import shoppingSuccessAnimation from './shopping-success.json';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  
  const lottieOptions = {
    animationData: shoppingSuccessAnimation, 
    loop: false, // The animation will play only once
    autoplay: true,
  };

  const { View, isLoaded, isComplete } = useLottie(lottieOptions);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center max-w-lg w-full">
        <div className="w-48 h-48 mx-auto mb-6">
          {/* Render the animation view.
            Because loop is false, it will play once and then stop on the final frame (the tick mark).
          */}
          {View}
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-green-600 mb-4">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Thank you for your purchase.
        </p>
        
        <button
          onClick={() => navigate('/home')}
          className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;