import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToAnchor = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Find the element with the matching ID and scroll to it
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If there's no hash, scroll to the top of the page
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]); // The effect runs whenever the URL's path or hash changes

  return null;
};

export default ScrollToAnchor;