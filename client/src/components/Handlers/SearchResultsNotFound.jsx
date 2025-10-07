import React from 'react';
import Lottie from 'lottie-react';
import notFoundAnimation from './searchNotFoundAnimation.json';
import './SearchResultsNotFound.css';

const SearchResultsNotFound = () => {
  return (
    <div className="search-not-found-container">
      <div className="search-lottie-animation-wrapper">
        <Lottie
          animationData={notFoundAnimation}
          loop={true}
          autoplay={true}
        />
      </div>
      <p className="search-not-found-message">Searched item not found.</p>
    </div>
  );
};

export default SearchResultsNotFound;