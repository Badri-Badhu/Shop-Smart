import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import FlashMessage from '../components/common/FlashMessage';
import './css/HomePage.css';
import { useCart } from './order management/CartContext';
import ErrorPage from '../components/Handlers/ErrorPage';
import RouteLoader from '../components/common/RouteLoader';

const categories = ['All','Fruits','Vegetables','Dairy','Bakery','Snacks','Beverages','Household'];

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [flash, setFlash] = useState({ show:false, message:'', type:'' });
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const message = params.get('message');
    const type = params.get('type');
    const authType = params.get('authType');

    if (token) {
      localStorage.setItem('token', token);
      axios.get(`${import.meta.env.VITE_API_URL}/api/auth/user`, { headers:{ Authorization:`Bearer ${token}` }})
        .then(res => {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          localStorage.setItem('authType', authType);
          setFlash({ show:true, message:message || '✅ Login successful!', type:type || 'success' });
          window.history.replaceState({}, document.title, '/home');
          navigate('/home');
        })
        .catch(err => setFlash({ show:true, message:'Failed to fetch user', type:'error' }));
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // Start loading
      setError(null); // Clear any previous errors

      let url = `${import.meta.env.VITE_API_URL}/api/products`;
      if (activeCategory !== 'All') url += `?category=${activeCategory}`;

      try {
        const res = await axios.get(url);
        setProducts(res.data);
        const initialVariants = {};
        res.data.forEach(product => {
          if (product.variants?.length > 0) initialVariants[product._id] = product.variants[0];
        });
        setSelectedVariants(initialVariants);
      } catch (err) {
        console.error('Product fetch error:', err);
        setError(true); // Set error state to true
      } finally {
        setLoading(false); // End loading regardless of success or failure
      }
    };
    fetchProducts();
  }, [activeCategory]);

  const handleVariantChange = (productId, event) => {
    const selectedWeight = Number(event.target.value);
    const product = products.find(p => p._id === productId);
    const newVariant = product.variants.find(v => v.weight === selectedWeight);
    setSelectedVariants(prev => ({ ...prev, [productId]: newVariant }));
  };

  const handleAddToCart = (productId) => {
    const variant = selectedVariants[productId];
    if (!variant) return;
    addToCart({ productId, variant, quantity:1});
    setFlash({ show:true, message:'Item added to cart!', type:'success' });
  };
  const userinfo=localStorage.getItem("user");
  const userObject = JSON.parse(userinfo);
  
  return (
    <div className="home-page">
      {flash.show && <FlashMessage message={flash.message} type={flash.type} onClose={()=>setFlash({...flash, show:false})} />}
      <div style={{ textAlign:"center" }}>
        <div className="intro-section">
          <h1 className="home-main-title">Welcome to Shop Smart 🛒</h1>
          <p className="subtitle">Your favorite groceries, delivered fresh.</p>
        </div>
      </div>

      <div className="home-categories-bar">
        {categories.map(cat => (
          <button key={cat} className={`home-category-btn ${activeCategory===cat?'active':''}`} onClick={()=>setActiveCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className="product-grid-container">
        {/* Conditional Rendering Logic moved here */}
        {loading ? (
          <div className="home-page-loading">
            <RouteLoader/>
          </div>
        ) : error ? (
          <ErrorPage 
            title="Failed to Load Products" 
            message="There was an error connecting to the server. Please check your internet connection and try again."
          />
        ) : (
          <div className="products-grid">
            {products.length === 0 ? <p className="no-products">No products found</p> :
              products.map(product => {
                const selectedVariant = selectedVariants[product._id] || product.variants[0];
                const hasDiscount = selectedVariant?.discountPrice && selectedVariant.discountPrice < selectedVariant.price;

                return (
                  <div key={product._id} className="product-card">
                    {hasDiscount && <div className="discount-tag">{Math.round(((selectedVariant.price-selectedVariant.discountPrice)/selectedVariant.price)*100)}% OFF</div>}
                    
                    <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <img src={product.imageUrl} alt={product.name} />
                      <div className="card-body">
                        <h3 id='home-h3'>{product.name}</h3>
                      </div>
                    </Link>

                    <div className="card-body">
                      <div className="variant-selector">
                        <p className="product-weight">{selectedVariant?.weight} {selectedVariant?.unit}</p>
                        <select 
                          className="weight-dropdown" 
                          value={selectedVariant?.weight || ''} 
                          onChange={e => handleVariantChange(product._id, e)}
                        >
                          {product.variants.map((v,i) => <option key={i} value={v.weight}>{v.weight} {v.unit}</option>)}
                        </select>
                      </div>
                      <div className="price-container">
                        {hasDiscount ? (
                          <>
                            <p className="original-price">₹ {selectedVariant.price.toFixed(2)}</p>
                            <p className="discounted-price">₹ {selectedVariant.discountPrice.toFixed(2)}</p>
                          </>
                        ) : <p className="product-price">₹ {selectedVariant.price.toFixed(2)}</p>}
                      </div>
                      {!(userObject?.role === "dealer") && (
                        <button className="add-btn" onClick={() => handleAddToCart(product._id)}>
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;