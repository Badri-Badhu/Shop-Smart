import { useEffect, useState } from 'react';
import axios from 'axios';
import './css/CartPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './order management/CartContext';
import EmptyCart from '../components/Handlers/EmptyCart';

const CartPage = () => {
  const { cartItems, removeFromCart, updateCart } = useCart();
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [totals, setTotals] = useState({ subtotal: 0, totalSavings: 0, grandTotal: 0 });
  const navigate = useNavigate();

  // Fetch product details whenever cartItems change
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setProductDetailsMap({});
      return;
    }

    const fetchDetails = async () => {
      try {
        const requests = cartItems.map(item =>
          axios
            .get(`${import.meta.env.VITE_API_URL}/api/products/${item.productId}`)
            .then(res => [
              item.productId,
              { name: res.data.name, imageUrl: res.data.imageUrl || null }
            ])
            .catch(() => [item.productId, { name: 'Unknown Product', imageUrl: null }])
        );

        const results = await Promise.all(requests);
        setProductDetailsMap(Object.fromEntries(results));
      } catch (err) {
        console.error('Failed to fetch product details:', err);
      }
    };

    fetchDetails();
  }, [cartItems]);

  // Calculate totals whenever cartItems change
  useEffect(() => {
    const subtotal = cartItems.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);
    const grandTotal = cartItems.reduce(
      (sum, i) => sum + (i.variant.discountPrice ?? i.variant.price) * i.quantity,
      0
    );
    const totalSavings = subtotal - grandTotal;
    setTotals({ subtotal, totalSavings, grandTotal });
  }, [cartItems]);

  const handleQuantityChange = (productId, variantWeight, change) => {
    const item = cartItems.find(i => i.productId === productId && i.variant.weight === variantWeight);
    if (!item) return;

    const newQty = item.quantity + change;
    if (newQty <= 0) removeFromCart(productId, variantWeight);
    else updateCart({ ...item, quantity: newQty, qty: newQty });
  };

  const handleProceedToCheckout = () => {
    navigate('/order-summary', { state: { cartItems, totals } });
  };

  if (!cartItems) return null;

  return (
    <div className="cart-page">
      {cartItems.length !== 0 &&(
      <Link to="/home" className="we-r-back">Back to home</Link>)}
      <h1 className="cart-title">Your Shopping Cart 🛒</h1>

      {cartItems.length === 0 ? (
        <EmptyCart/>
      ) : (
        <div className="cart-container">
          <div className="cart-items-list">
            {cartItems.map(item => {
              const { productId, variant, quantity } = item;
              const details = productDetailsMap[productId] || { name: 'Loading...', imageUrl: null };
              const hasDiscount = variant.discountPrice && variant.discountPrice < variant.price;
              const finalPrice = hasDiscount ? variant.discountPrice : variant.price;

              return (
                <div className="cart-item" key={`${productId}-${variant.weight}`}>
                  {details.imageUrl ? (
                    <img src={details.imageUrl} alt={details.name} className="cart-item-image" />
                  ) : (
                    <div className="cart-item-placeholder" />
                  )}
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{details.name}</h4>
                    <p className="cart-item-variant">{variant.weight} {variant.unit}</p>
                    <div className="cart-item-price-info">
                      {hasDiscount && <span className="cart-original-price">₹ {variant.price.toFixed(2)}</span>}
                      <span className="cart-price">₹ {finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button onClick={() => handleQuantityChange(productId, variant.weight, -1)}>-</button>
                      <span className="quantity-display">{quantity}</span>
                      <button onClick={() => handleQuantityChange(productId, variant.weight, 1)}>+</button>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(productId, variant.weight)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h3>Price Details</h3>
            <div className="summary-details">
              {cartItems.map(item => {
                const { productId, variant, quantity } = item;
                const details = productDetailsMap[productId] || { name: 'Loading...', imageUrl: null };
                const itemPrice = variant.discountPrice || variant.price;
                const itemTotal = itemPrice * quantity;
                const itemSavings = (variant.price - itemPrice) * quantity;

                return (
                  <div className="summary-item" key={`${productId}-${variant.weight}`}>
                    <p className="summary-item-name">
                      {details.name} <span className="item-quantity">({quantity} x)</span>
                    </p>
                    <div className="summary-item-prices">
                      <p className="summary-item-price">₹ {itemTotal.toFixed(2)}</p>
                      {itemSavings > 0 && <p className="summary-item-savings">You saved: ₹ {itemSavings.toFixed(2)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span className="summary-label">Subtotal:</span>
                <span className="summary-value">₹ {totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.totalSavings > 0 && (
                <div className="summary-row savings-row">
                  <span className="summary-label">Total Savings:</span>
                  <span className="summary-value">₹ {totals.totalSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total-price">
                <span className="summary-label">Grand Total:</span>
                <span className="summary-value">₹ {totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button className="checkout-btn" onClick={handleProceedToCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
