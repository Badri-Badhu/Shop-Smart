import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/OrderSummary.css';
import { useCart } from './order management/CartContext';
import RouteLoader from '../components/common/RouteLoader';



const OrderSummary = () => {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressDropdown, setShowAddressDropdown] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [totals, setTotals] = useState({
        subtotal: 0,
        totalSavings: 0,
        grandTotal: 0,
        couponDiscount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [flashMessage, setFlashMessage] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [deliveryCharge, setDeliveryCharge] = useState(0);

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState([]);

    const [partnerSource, setPartnerSource] = useState('');
    const [needsPartnerInput, setNeedsPartnerInput] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Flash message helper
    const showFlashMessage = (message, type = 'error') => {
        setFlashMessage({ message, type });
        setTimeout(() => setFlashMessage(null), 3000);
    };

    // Fetch detailed cart items
    const fetchDetailedCartItems = async (cartData) => {
        try {
            const detailedItems = await Promise.all(
                cartData.map(async (item) => {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${item.productId}`);
                    const product = res.data;

                    if (!product || !product._id) {
                        console.error("Fetched product is invalid or missing an ID.");
                        return null;
                    }
                    
                    const variant = product.variants?.find(v => v.weight === item.variant?.weight && v.unit === item.variant?.unit) || null;

                    if (!variant) {
                        console.error("Variant not found for product:", product.name);
                        return null;
                    }

                    return {
                        ...item,
                        productId: product._id,
                        name: product.name,
                        imageUrl: product.imageUrl,
                        variant: variant,
                        price: variant.price,
                        discountPrice: variant.discountPrice ?? null,
                        dealerId: product.dealerId || null,
                    };
                })
            );
            setCartItems(detailedItems.filter(item => item !== null));
        } catch (err) {
            setError("Failed to fetch product details.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch available coupons
    const fetchAvailableCoupons = async (userId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/coupons/available`, { params: { userId } });
            setAvailableCoupons(res.data || []);
        } catch (err) {
            console.error("Failed to fetch coupons:", err);
        }
    };

    // Calculate totals
const calculateTotals = (items, coupon = null) => {
    let subtotal = 0, totalSavings = 0, grandTotal = 0, couponDiscount = 0;

    items.forEach(item => {
        const price = Number(item.price || 0);
        const discountPrice = Number(item.discountPrice ?? price);
        subtotal += price * Number(item.quantity || 0);
        totalSavings += (price - discountPrice) * Number(item.quantity || 0);
        grandTotal += discountPrice * Number(item.quantity || 0);
    });

    const finalDeliveryCharge = grandTotal < 200 ? 32 : 0;
    grandTotal += finalDeliveryCharge;

    if (coupon) {
        // --- FIX IS HERE: Use discountAmount and handle coupon types ---
        let discountAmount = 0;
        
        if (coupon.type === 'percentage') {
            const percentageValue = Number(coupon.value ?? 0);
            discountAmount = (grandTotal * percentageValue) / 100;
        } else if (coupon.type === 'fixed_amount') {
            discountAmount = Number(coupon.value ?? 0);
        }
        // Fallback for other or missing types
        else {
            discountAmount = Number(coupon.value ?? coupon.discountValue ?? 0);
        }

        if (coupon.minOrderValue && grandTotal < coupon.minOrderValue) {
            setCouponError(`Coupon requires a minimum order of ₹${coupon.minOrderValue}.`);
            couponDiscount = 0;
            setAppliedCoupon(null);
            setNeedsPartnerInput(false);
        } else {
            grandTotal = Math.max(0, grandTotal - discountAmount);
            setCouponError(null);
            couponDiscount = discountAmount;
        }
    }

    setDeliveryCharge(finalDeliveryCharge);
    setTotals({ subtotal, totalSavings, grandTotal, couponDiscount });
};
    // Load user/cart/coupons
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedCart = localStorage.getItem('cartItems');
        const parsedCart = storedCart ? JSON.parse(storedCart) : [];

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (parsedUser.addresses?.length) {
                setAddresses(parsedUser.addresses);
                setSelectedAddress(parsedUser.addresses[0]);
            }
            fetchAvailableCoupons(parsedUser._id);
        } else {
            fetchAvailableCoupons(null);
        }

        if (parsedCart.length > 0) {
            fetchDetailedCartItems(parsedCart);
        } else {
            setLoading(false);
        }
    }, []);

    // Recalculate totals when cart or coupon changes
    useEffect(() => {
        if (cartItems.length > 0) calculateTotals(cartItems, appliedCoupon);
    }, [cartItems, appliedCoupon]);

    // Address handlers
    const handleAddAddress = () => navigate('/dashboard');
    const handleAddressSelection = (address) => {
        setSelectedAddress(address);
        setShowAddressDropdown(false);
    };

    // Coupon handlers
    const handleCouponInputChange = (e) => {
        const val = e.target.value;
        setCouponCode(val);
        if (appliedCoupon) setAppliedCoupon(null);
        setNeedsPartnerInput(false);
        setPartnerSource('');
        setCouponError(null);
    };

    const handleSelectCoupon = (coupon) => {
        setCouponCode(coupon.code || '');
        setAppliedCoupon(null);
        setNeedsPartnerInput(false);
        setPartnerSource('');
        setCouponError(null);
    };

    const handleApplyCoupon = async (e) => {
        e?.preventDefault?.();
        if (!couponCode?.trim()) return setCouponError('Please enter a coupon code.');
        if (!user?._id) return setCouponError('Please login to apply coupon.');

        setCouponLoading(true);
        setCouponError(null);

        const payload = {
            couponCode: couponCode.trim().toUpperCase(),
            userId: user._id,
            orderTotal: totals.grandTotal,
            cartProductIds: cartItems.map(item => item.productId || item.product),
        };
        if (needsPartnerInput && partnerSource?.trim()) payload.source = partnerSource.trim();

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/coupons/apply`, payload);
            const data = res.data;

            if (data.requiresPartnerInput) {
                setNeedsPartnerInput(true);
                showFlashMessage(data.message || 'Additional info required for this coupon', 'error');
                return;
            }

            if (data.success) {
                  const discountValueFromBackend = data.coupon?.value ?? data.discountAmount ?? 0;
                    const backendCoupon = {
                      ...data.coupon,  
                    };
                setAppliedCoupon(backendCoupon);
                setNeedsPartnerInput(false);
                setPartnerSource('');
                calculateTotals(cartItems, backendCoupon);
                showFlashMessage(data.message || `Coupon ${payload.couponCode} applied!`, 'success');
            } else {
                setCouponError(data.message || 'Could not apply coupon');
                setAppliedCoupon(null);
                setNeedsPartnerInput(false);
            }
        } catch (err) {
            setCouponError(err?.response?.data?.message || 'Failed to apply coupon.');
            setAppliedCoupon(null);
            setNeedsPartnerInput(false);
        } finally {
            setCouponLoading(false);
        }
    };

    const couponButtonLabel = () => appliedCoupon ? 'Applied' : needsPartnerInput ? 'Submit' : 'Apply';
    const couponButtonDisabled = () => couponLoading || !couponCode?.trim() || appliedCoupon;

    const getCouponMessage = () => {
        if (couponError) return <p className="text-red-500 text-sm mt-2">{couponError}</p>;
        if (needsPartnerInput) return <p className="text-blue-600 text-sm mt-2">Please enter partner name and press Submit.</p>;
        if (appliedCoupon) return <p className="text-green-600 text-sm mt-2">Coupon "{appliedCoupon.code}" applied! Discount: ₹{totals.couponDiscount.toFixed(2)}</p>;
        return null;
    };

    // Place order
    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            showFlashMessage("Please select a delivery address.");
            return;
        }

        const validCartItems = cartItems.filter(item => {
            return item.productId || (item.product && item.product._id);
        });

        if (validCartItems.length === 0) {
            showFlashMessage("Your cart is empty or contains invalid items.");
            return;
        }

        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token || !user?._id) {
            showFlashMessage("User not authenticated.");
            return;
        }

        const finalShippingAddress = {
            ...selectedAddress,
            to: selectedAddress.to || user.firstName || user.name,
            contactNo: selectedAddress.contactNo || user.phone,
        };

        const orderItemsForBackend = validCartItems.map(ci => ({
            productId: ci.productId || ci.product?._id,
            name: ci.name,
            imageUrl: ci.imageUrl,
            variant: ci.variant,
            quantity: ci.quantity,
            price: ci.price,
            discountPrice: ci.discountPrice ?? null,
        }));

        const orderData = {
            user: user._id,
            shippingAddress: finalShippingAddress,
            cartItems: orderItemsForBackend,
            paymentMethod,
            coupon: appliedCoupon  ? {
                    code: appliedCoupon.code,
                    description: appliedCoupon.description,
                    discountValue: totals.couponDiscount, // what you applied
                    type: appliedCoupon.type,
                                      }:null,
            itemsSubtotal: totals.subtotal,
            totalSavings: totals.totalSavings,
            deliveryCharge,
            couponDiscount: totals.couponDiscount,
            grandTotal: totals.grandTotal,
        };

        setIsPlacingOrder(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/orders`,
                orderData,
                { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
            );

            if (res.status === 201) {
                clearCart();
                localStorage.removeItem('cartTotals');
                showFlashMessage("Order placed successfully!", 'success');
                setTimeout(() => navigate('/order-success', { state: { orderId: res.data._id } }), 800);
            }
        } catch (err) {
            console.error("Failed to place order:", err.response || err);
            showFlashMessage(err.response?.data?.message || "Failed to place order.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (loading) {
        <RouteLoader/>
        return <div className="text-center p-8">Loading order summary...</div>;};
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="order-summary-page font-inter">

            {flashMessage && (
                <div className={`flash-message ${flashMessage.type}`}>
                    {flashMessage.message}
                </div>
            )}

            <div className="order-summary-container">
                <div className="main-content-column">
                    <h1 className="main-title">Order Summary</h1>

                    <div className="card">
                        <div className="address-header">
                            <h2 className="section-heading">Deliver to:</h2>
                            {addresses.length > 0 && (<button onClick={() => setShowAddressDropdown(!showAddressDropdown)} className="change-address-btn">Change</button>)}
                        </div>

                        {addresses.length === 0 ? (
                            <div className="no-address-container">
                                <p className="no-address-text">No delivery address found.</p>
                                <button onClick={handleAddAddress} className="add-address-btn">Add Address</button>
                            </div>
                        ) : selectedAddress && (
                            <div className="selected-address-card">
                                <div className="address-info">
                                    <h3 className="text-lg font-semibold text-gray-800">{selectedAddress.to}</h3>
                                    <span className="address-type-badge">{selectedAddress.type}</span>
                                </div>
                                <p className="text-gray-600 mb-1">{selectedAddress.door_no}, {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} ,{selectedAddress.postalCode}</p>
                                <p className="text-gray-600">Contact No : {user?.phone}</p>
                                {selectedAddress.alt_no && (<p className="text-gray-600">Alternate No : +91{selectedAddress.alt_no}</p>)}
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h2 className="section-heading">Order Items ({cartItems.length})</h2>
                        <div className="product-scroll-container space-y-4">
                            {cartItems.map((item, index) => {
                                const finalPrice = item.discountPrice || item.price;
                                return (
                                    <div key={index} className="order-item">
                                        <img src={item.imageUrl} alt={item.name} className="item-image" />
                                        <div className="item-details-grid">
                                            <h4 className="col-span-2 font-semibold text-gray-800 mb-1">{item.name}</h4>
                                            <div className="col-span-1">
                                                <p className="item-quantity">Qty: {item.quantity}</p>
                                                <p className="item-variant">{item.variant?.weight} {item.variant?.unit}</p>
                                            </div>
                                            <div className="item-price-info">
                                                {item.discountPrice && (<p className="original-price">₹{item.price.toFixed(2)}</p>)}
                                                <p className="final-price">₹{finalPrice.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="sidebar-column">
                    <div className="card">
                        <h2 className="section-heading">Price Details</h2>
                        <div className="price-details-grid">
                            <div className="price-row">
                                <p className="price-label">Subtotal</p>
                                <p className="price-value">₹{totals.subtotal.toFixed(2)}</p>
                            </div>
                            <div className="price-row savings-text">
                                <p>Total Savings</p>
                                <p className="price-value">- ₹{totals.totalSavings.toFixed(2)}</p>
                            </div>
                            {deliveryCharge > 0 && (
                                <div className="price-row">
                                    <p className="price-label">Delivery Charges</p>
                                    <p className="price-value">+₹{deliveryCharge.toFixed(2)}</p>
                                </div>
                            )}
                            {deliveryCharge > 0 && (
                                <p className="delivery-info-text">Free delivery on orders above ₹200</p>
                            )}
                            {totals.couponDiscount > 0 && (
                                <div className="price-row discount-text">
                                    <p>Coupon Discount</p>
                                    <p className="price-value">- ₹{totals.couponDiscount.toFixed(2)}</p>
                                </div>
                            )}
                            <div className="grand-total-row">
                                <p>Grand Total</p>
                                <p>₹{totals.grandTotal.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="section-heading">Coupons</h2>
                        <form onSubmit={handleApplyCoupon}>
                            <div className="coupon-form-container">
                                <input name="couphand" type="text" placeholder="Enter coupon code" value={couponCode} onChange={handleCouponInputChange} className="coupon-input" />
                                <button type="submit" disabled={couponButtonDisabled()} className={`apply-coupon-btn ${couponButtonDisabled() ? 'disabled' : ''}`}>
                                    {couponLoading ? 'Processing...' : couponButtonLabel()}
                                </button>
                            </div>

                            {needsPartnerInput && (
                                <div className="mt-4 fade-in">
                                    <p className="text-sm text-gray-600 mb-2">Enter the partner name:</p>
                                    <input type="text" placeholder="e.g., Paytm" value={partnerSource} onChange={(e) => setPartnerSource(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200" />
                                </div>
                            )}
                        </form>
                        {getCouponMessage()}

                        {availableCoupons.length > 0 && (
                            <div className="available-coupons-container">
                                <h3 className="available-coupons-title">Available Coupons</h3>
                                <div className="space-y-3">
                                    {availableCoupons.map((coupon) => (
                                        <div key={coupon._id} onClick={() => handleSelectCoupon(coupon)} className="coupon-list-item">
                                            <p className="coupon-code">{coupon.code}</p>
                                            <p className="coupon-description">{coupon.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h2 className="section-heading">Payment Method</h2>
                        <div className="payment-method-container">
                            <button onClick={() => setPaymentMethod('COD')} className={`payment-method-btn ${paymentMethod === 'COD' ? 'active' : ''}`}>Cash on Delivery</button>
                            <button disabled onClick={() => setPaymentMethod('Online')} className={`payment-method-btn ${paymentMethod === 'Online' ? 'active' : ''}`}>Pay Online<br />(Not available)</button>
                        </div>
                    </div>
                        <button
                            onClick={handlePlaceOrder}
                            className="place-order-btn"
                            disabled={isPlacingOrder}
                        >
                            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>

                {showAddressDropdown && (
                    <div className="address-dropdown-overlay">
                        <div className="address-dropdown-modal">
                            <div className="modal-header">
                                <h3 className="modal-title">Select delivery address</h3>
                                <button onClick={() => setShowAddressDropdown(false)} className="modal-close-btn">&times;</button>
                            </div>
                            <div className="address-list-container">
                                {addresses.map((address, index) => (
                                    <div key={index} onClick={() => handleAddressSelection(address)} className={`address-list-item ${selectedAddress?.door_no === address.door_no ? 'selected' : ''}`}>
                                        <div className="address-details-header">
                                            <div className="address-info-column">
                                                <div className="address-info-row">
                                                    <span className="font-semibold">{address.to}</span>
                                                    <span className="address-type-badge">{address.type}</span>
                                                </div>
                                                <p className="text-sm text-gray-600">{address.door_no}, {address.street}, {address.city}</p>
                                            </div>
                                            {selectedAddress?.door_no === address.door_no && (<span className="selected-badge">Currently selected</span>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderSummary;