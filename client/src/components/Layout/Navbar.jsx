import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import './layoutcss/Navbar.css';
import { useCart } from '../../pages/order management/CartContext';
import maleIcon from '../../assets/profile-male.png';
import femaleIcon from '../../assets/profile-female.png';
import defaultIcon from '../../assets/profile-default.png';
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { clearCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  // Ref to the search container to detect clicks outside
  const searchContainerRef = useRef(null);

  useEffect(() => { 
    setShowSearch(location.pathname !== '/'); 
    setSuggestions([]); // Clear suggestions on page navigation
  }, [location]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(user));
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  }, [location.key]);

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length > 0) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/search?q=${query}`);
          setSuggestions(res.data.slice(0, 5));
        } catch (error) {
          console.error("Failed to fetch suggestions:", error);
          setSuggestions([]); 
        }
      } else {
        setSuggestions([]);
      }
    }, 200),
    []
  );

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchSuggestions(e.target.value);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSuggestions([]);
      navigate(`/search-results?q=${searchQuery}`);
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchQuery(name);
    setSuggestions([]);
    navigate(`/search-results?q=${name}`);
  };

  // New useEffect to handle clicks outside the search container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSuggestions([]); // Clear suggestions if click is outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const toggleMenu = () => setMenuOpen(prev => !prev);
  const handleLogout = () => { clearCart();localStorage.clear(); navigate('/'); };
  const getProfileImage = () => {
    if (!userData?.gender) return defaultIcon;
    const g = userData.gender.toLowerCase();
    return g === 'male' ? maleIcon : g === 'female' ? femaleIcon : defaultIcon;
  };

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <Link to="/" className="logo">Shop Smart</Link>
        <button className="menu-toggle" onClick={toggleMenu}>☰</button>
      </div>

      {showSearch && (
        <form onSubmit={handleSearch} className="search-bar-container" ref={searchContainerRef}>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search groceries..."
              value={searchQuery}
              onChange={handleInputChange}
            />
            <button type="submit">Search</button>
          </div>
          {suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((item) => (
                <li key={item._id} onClick={() => handleSuggestionClick(item.name)}>
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </form>
      )}
        
              <div className={`navbar-right ${menuOpen ? 'show' : ''}`}>
            {userData?.role!=="dealer"&&(
                <Link to="/cart" className="relative nav-btn cart-navi">
                  🛒Cart
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
       ) }
        {isLoggedIn ? (
          <>{userData.role==="dealer"&&(
            <Link to="/product-manager-dashboard?tab=orders" className="dashboard-btn-1 nav-btn nav-new">Orders</Link> )}  
            <Link to="/dashboard" className="dashboard-btn-1 nav-btn nav-new">Dashboard</Link>
            <Link to="/home">
              <div className="profile-info">
                <img src={getProfileImage()} alt="Profile" className="profile-icon" />
                <span className="profile-name-nav">{userData?.firstName}</span>
              </div>
            </Link>
            <button onClick={handleLogout} className="nav-btn logout-btn nav-new">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn nav-new">Login</Link>
            <Link to="/signup" className="nav-btn nav-new">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;