import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductEditForm from './ProductEditForm';
import ConfirmationPopup from '../../../components/common/ConfirmationPopup';
import './css/ProductHandler.css';
import RouteLoader from '../../../components/common/RouteLoader';
import ErrorPage from '../../../components/Handlers/ErrorPage';
// Define the categories for the filter buttons
const categories = [
  'All',
  'Fruits',
  'Vegetables',
  'Dairy',
  'Bakery',
  'Snacks',
  'Beverages',
  'Household',
];

const ProductHandler = ({ showFlash }) => {
  // Original state for all fetched products
  const [allProducts, setAllProducts] = useState([]);
  // State for products displayed after filtering
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealerId, setDealerId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  // State for active category
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user._id) {
      setDealerId(user._id);
      if (user.role === 'admin') {
        setIsAdmin(true);
      }
    } else {
      setError('User not found. Please log in.');
      setLoading(false);
    }
  }, []);

const fetchProducts = async () => {
  if (!dealerId && !isAdmin) return;
  try {
    setLoading(true);
    const token = localStorage.getItem('token'); // get token once
    let res;
    if (isAdmin) {
      // Fetch all products for admin
      res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      // Fetch products by dealer ID for a normal user
      res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/dealer/${dealerId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // <-- add this
        },
      });
    }
    setAllProducts(res.data);
    setFilteredProducts(res.data);
  } catch (err) {
    console.error('Error fetching products:', err);
    setError('Failed to fetch products. Please try again.');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchProducts();
  }, [dealerId, isAdmin]);

  // New useEffect hook to handle front-end filtering when activeCategory changes
  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter((product) => product.category === activeCategory);
      setFilteredProducts(filtered);
    }
  }, [activeCategory, allProducts]);

  const confirmDelete = (productId) => {
    setProductToDelete(productId);
    setShowPopup(true);
  };

  const handleDeleteConfirmed = async () => {
    setShowPopup(false);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${productToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update both allProducts and filteredProducts
      setAllProducts(allProducts.filter((p) => p._id !== productToDelete));
      showFlash('Product deleted successfully! 🗑️', 'success');
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      showFlash('Error deleting product.', 'error');
    }
  };

  const handleCancelDelete = () => {
    setShowPopup(false);
    setProductToDelete(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleUpdate = () => {
    setEditingProduct(null);
    fetchProducts();
  };

  if (loading) {
    <RouteLoader/>
    return <div className="loading-state">Loading products...</div>;
  }

  if (error) {
    return (
      <ErrorPage 
        title="Failed to Load Your Products" 
        message="There was an error connecting to the server. Please check your internet connection and try again."
      />
    );
  }

  return (
    <div className="product-handler">
      <h3 className="handler-title">Manage Your Products ({filteredProducts.length})</h3>

      <div className="home-categories-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`home-category-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <p className="no-products-message">You have no products listed. Add some!</p>
      ) : (
        <div className="product-card-grid">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product._id}>
              <img src={product.imageUrl} alt={product.name} className="product-card-image" />
              <div className="card-details">
                <h4 className="product-card-name">{product.name}</h4>
                <p className="product-card-category">{product.category}</p>
                <p className="product-card-price">
                  ₹{product.variants[0]?.price.toFixed(2)} / {product.variants[0]?.weight}
                  {product.variants[0]?.unit}
                </p>
                {isAdmin && product.dealerId && (
                  <p className="product-dealer-name">
                    By: {product.dealerId.firstName} {product.dealerId.lastName}
                  </p>
                )}
              </div>
              <div className="card-actions">
                <button className="edit-btn" onClick={() => handleEdit(product)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => confirmDelete(product._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conditionally render the edit form below the product cards */}
      {editingProduct && (
        <div className="edit-form-container">
          <ProductEditForm product={editingProduct} onUpdate={handleUpdate} showFlash={showFlash} />
        </div>
      )}

      {showPopup && (
        <ConfirmationPopup
          message="Are you sure you want to delete this product?"
          onConfirm={handleDeleteConfirmed}
          onCancel={handleCancelDelete}
          confirmText="Delete Product"
        />
      )}
    </div>
  );
};

export default ProductHandler;