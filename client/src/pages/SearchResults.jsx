import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './order management/CartContext';
import FlashMessage from '../components/common/FlashMessage';
import "./css/SearchResults.css";
import SearchResultsNotFound from '../components/Handlers/SearchResultsNotFound';

const SearchResults = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [flash, setFlash] = useState({ show: false, message: '', type: '' });
  
  const { addToCart } = useCart();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query) return;

      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/search?q=${query}`);
        setProducts(response.data);
        
        // Initialize selected variants for each product
        const initialVariants = {};
        response.data.forEach(product => {
          if (product.variants?.length > 0) {
            initialVariants[product._id] = product.variants[0];
          }
        });
        setSelectedVariants(initialVariants);

      } catch (err) {
        console.error("Failed to fetch search results:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  const handleVariantChange = (productId, event) => {
    const selectedWeight = Number(event.target.value);
    const product = products.find(p => p._id === productId);
    const newVariant = product.variants.find(v => v.weight === selectedWeight);
    setSelectedVariants(prev => ({ ...prev, [productId]: newVariant }));
  };

  const handleAddToCart = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = selectedVariants[productId];
    if (!variant) return;
    addToCart({ productId, variant, quantity: 1 });
    setFlash({ show: true, message: 'Item added to cart!', type: 'success' });
  };
 const userinfo=localStorage.getItem("user");
  const userObject = JSON.parse(userinfo);
  
  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="search-results-container">
      {flash.show && <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash({ ...flash, show: false })} />}
      <h2>Search Results for "{query}"</h2>
      {products.length === 0 ? (
        <SearchResultsNotFound/>
      ) : (
        <div className="product-list">
          {products.map(product => {
            const selectedVariant = selectedVariants[product._id] || product.variants[0];
            const hasDiscount = selectedVariant?.discountPrice && selectedVariant.discountPrice < selectedVariant.price;
            
            return (
              <Link key={product._id} to={`/products/${product._id}`} className="product-card">
                {hasDiscount && <div className="discount-tag">{Math.round(((selectedVariant.price - selectedVariant.discountPrice) / selectedVariant.price) * 100)}% OFF</div>}
                <img src={product.imageUrl} alt={product.name} />
                <div className="card-body">
                  <h3>{product.name}</h3>
                  <div className="variant-selector">
                    <p className="product-weight">{selectedVariant?.weight} {selectedVariant?.unit}</p>
                    <select 
                      className="weight-dropdown"
                      value={selectedVariant?.weight || ''}
                      onChange={e => handleVariantChange(product._id, e)}
                      onClick={e => e.preventDefault()}
                    >
                      {product.variants.map((v, i) => <option key={i} value={v.weight}>{v.weight} {v.unit}</option>)}
                    </select>
                  </div>
                  <div className="price-container">
                    {hasDiscount ? (
                      <>
                        <p className="ser-original-price">₹ {selectedVariant.price.toFixed(2)}</p>
                        <p className="ser-discounted-price">₹ {selectedVariant.discountPrice.toFixed(2)}</p>
                      </>
                    ) : <p className="ser-product-price">₹ {selectedVariant.price.toFixed(2)}</p>}
                  </div>
                {!(userObject?.role === "dealer") && (
                  <button className="add-btn" onClick={e => handleAddToCart(product._id, e)}>
                    Add to Cart
                  </button>)}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
