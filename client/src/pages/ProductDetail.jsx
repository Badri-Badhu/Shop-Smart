import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import axios from "axios";
import "./css/ProductDetail.css";
import { useCart } from "./order management/CartContext";
import FlashMessage from "../components/common/FlashMessage"; 
import RouteLoader from "../components/common/RouteLoader";

const ProductDetail = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showDescription, setShowDescription] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [mobileIndex, setMobileIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Flash state
  const [flash, setFlash] = useState({ message: "", type: "success" });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products/${productId}`
        );
        const fetchedProduct = response.data;
        setProduct(fetchedProduct);

        if (fetchedProduct.variants?.length > 0) {
          setSelectedVariant(fetchedProduct.variants[0]);
        }

        const imgs = [
          fetchedProduct.imageUrl,
          ...(Array.isArray(fetchedProduct.images) ? fetchedProduct.images : []),
        ].filter(Boolean);

        setMainImage(imgs[0]);
        setMobileIndex(0);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch product details.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleVariantSelect = (variant) => setSelectedVariant(variant);
 const user=localStorage.getItem('user');
 const userinfo=JSON.parse(user);
  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const itemToAdd = {
      productId: product._id,
      name: product.name,
      imageUrl: mainImage,
      variant: selectedVariant,
      price: selectedVariant.price,
      discountPrice: selectedVariant.discountPrice ?? null,
      quantity,
    };

    addToCart(itemToAdd);

    // Show flash message instead of alert
    setFlash({
      message: `${product.name} (${selectedVariant.weight}${selectedVariant.unit}) x${quantity} added to cart!`,
      type: "success",
    });
  };

  const handlePrev = () => {
    if (!product) return;
    const images = [product.imageUrl, ...(product.images || [])].filter(Boolean);
    const newIndex = mobileIndex === 0 ? images.length - 1 : mobileIndex - 1;
    setMobileIndex(newIndex);
    setMainImage(images[newIndex]);
  };

  const handleNext = () => {
    if (!product) return;
    const images = [product.imageUrl, ...(product.images || [])].filter(Boolean);
    const newIndex = mobileIndex === images.length - 1 ? 0 : mobileIndex + 1;
    setMobileIndex(newIndex);
    setMainImage(images[newIndex]);
  };

  if (loading) {
  <RouteLoader/>
  };
  if (error) return <div className="error-state">{error}</div>;
  if (!product) return <div className="not-found-state">Product not found.</div>;

  const originalPrice = selectedVariant?.price;
  const discountedPrice = selectedVariant?.discountPrice ?? 0;
  const discountPercent =
    discountedPrice > 0
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : 0;

  const thumbnails = [product.imageUrl, ...(product.images || [])].filter(Boolean);
  const hasDiscount = selectedVariant?.discountPrice && selectedVariant.discountPrice < selectedVariant.price;

  return (
    <div className="product-detail-page">
     <div className="product-header">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
        </svg>
      </button>
      <h2 className="header-title">Product Details</h2>
    </div>

      {/* Flash Message */}
      {flash.message && (
        <FlashMessage
          message={flash.message}
          type={flash.type}
          onClose={() => setFlash({ message: "", type: "success" })}
        />
      )}
      

      <div className="product-detail-container">
        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image-container">
            <img src={mainImage} alt={product.name} className="main-image" />
            {discountPercent > 0 && (
              <div className="discount-badge">{discountPercent}% OFF</div>
            )}
          </div>

          {/* Mobile Carousel */}
          {thumbnails.length > 1 && (
            <div className="mobile-carousel-controls">
              <button onClick={handlePrev} className="carousel-btn">&lt;</button>
              <button onClick={handleNext} className="carousel-btn">&gt;</button>
            </div>
          )}

          {/* Desktop Thumbnails */}
          {thumbnails.length > 1 && (
            <div className="thumbnail-carousel">
              {thumbnails.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className={`thumbnail-image ${mainImage === img ? "active" : ""}`}
                  onClick={() => {
                    setMainImage(img);
                    setMobileIndex(index);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="product-details">
          <h1 className="product-name">{product.name}</h1>

          <div className="price-info">
            {hasDiscount ? (
              <>
                <p className="det-original-price">₹{selectedVariant.price.toFixed(0)}</p>
                <p className="det-discounted-price">₹{selectedVariant.discountPrice.toFixed(0)}</p>
              </>
            ) : (
              <p className="det-product-price">₹{selectedVariant.price.toFixed(0)}</p>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="quantity-input">
            <button onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(prev => prev + 1)}>+</button>
          </div>

          {/* Available Variants */}
          {product.variants?.length > 0 && (
            <div className="quantity-selector">
              <p className="section-title">Available Quantities</p>
              <div className="variants-container">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    onClick={() => handleVariantSelect(variant)}
                    className={`variant-button ${selectedVariant?._id === variant._id ? "active" : ""}`}
                  >
                    {variant.weight} {variant.unit}
                  </button>
                ))}
              </div>
            </div>
          )}
        {!(userinfo?.role === "dealer") && (
          <button onClick={handleAddToCart} className="add-to-cart-button">
            Add to Cart
          </button>
        )}
          {/* Product Description */}
          <div className="product-description-container">
            <div
              className="description-header"
              onClick={() => setShowDescription(!showDescription)}
            >
              <h3 className="section-title">Product Information</h3>
              <svg
                className={`toggle-icon ${showDescription ? "rotate" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            {showDescription && <p className="description-text">{product.description}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
