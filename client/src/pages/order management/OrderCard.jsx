import React, { useState,useEffect } from 'react';
import './css/OrderHistory.css';
import axios from 'axios';
import placeholderImage from "../../assets/item-not-found.jpg";

const OrderCard = ({
    order,
    onStatusChange,
    userRole,
    showFlashMessage,
    isExpanded,
    toggleExpanded,
    loggedInDealerId
}) => {
    const [pinInput, setPinInput] = useState('');
    const [isPinSubmitting, setIsPinSubmitting] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState(null);
   const [dealerCouponDiscount, setDealerCouponDiscount] = useState(0);

    // === Helper Functions ===
    const getProgressWidth = (status) => {
        const activeStatuses = ["Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
        const currentIndex = activeStatuses.indexOf(status);
        if (currentIndex < 0) return '0%';
        const percentage = (currentIndex / (activeStatuses.length - 1)) * 100;
        return `${percentage}%`;
    };

    const renderStatus = (statusLabel, currentDealerStatus) => {
        const allStatuses = ["Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
        const statusIndex = allStatuses.indexOf(statusLabel);
        const currentStatusIndex = allStatuses.indexOf(currentDealerStatus);
        const showTick = statusLabel !== "Cancelled" && (statusLabel === "Pending" || statusIndex <= currentStatusIndex);
        const isActive = statusIndex <= currentStatusIndex;

        return (
            <div className={`status-item ${isActive ? 'active' : ''}`}>
                <div className="status-circle">
                    {showTick && <span className="tick">&#10003;</span>}
                </div>
                <div className="status-label">{statusLabel}</div>
            </div>
        );
    };

    const handleCopy = (e, orderId) => {
        e.stopPropagation();
        navigator.clipboard.writeText(orderId);
        showFlashMessage('Order ID copied to clipboard!', 'success');
    };

    const handleDeliver = async (orderId, dealerId, pin) => {
        setIsPinSubmitting(true);
        const token = localStorage.getItem('token');
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/deliver`,
                { dealerId, pin },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onStatusChange(orderId, dealerId, 'Delivered');
            showFlashMessage('Order delivered successfully!', 'success');
        } catch (e) {
            console.error("Failed to confirm delivery:", e);
            showFlashMessage(e.response?.data?.message || 'Failed to confirm delivery.', 'error');
        } finally {
            setIsPinSubmitting(false);
        }
    };

    const handleStatusChangeWithConfirmation = (e, dealerId) => {
        const newStatus = e.target.value;
        const currentStatus = pendingStatusChange?.newStatus || order.dealerGroups.find(g => g.dealerId === dealerId)?.status;

        if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(newStatus) && newStatus !== currentStatus) {
            setPendingStatusChange({
                orderId: order._id,
                dealerId: dealerId,
                newStatus: newStatus,
                reason: ''
            });
            setShowConfirmPopup(true);
        } else {
            onStatusChange(order._id, dealerId, newStatus);
        }
    };

    const confirmAction = () => {
        if (pendingStatusChange) {
            onStatusChange(
                pendingStatusChange.orderId,
                pendingStatusChange.dealerId,
                pendingStatusChange.newStatus,
                pendingStatusChange.reason
            );
        }
        setShowConfirmPopup(false);
        setPendingStatusChange(null);
    };

    const cancelAction = () => {
        setShowConfirmPopup(false);
        setPendingStatusChange(null);
    };

    const filteredDealerGroups = userRole === 'user'
        ? order.dealerGroups
        : order.dealerGroups.filter(group => group.dealerId.toString() === loggedInDealerId);

    const allProductImages = filteredDealerGroups.flatMap((group, gIndex) =>
        group.items.map((item, idx) => ({
            src: item.product?.imageUrl || placeholderImage,
            key: `${order._id}-g${gIndex}-i${idx}`
        }))
    );

    const isDealerOrAdmin = userRole === 'dealer' || userRole === 'admin';
    
    // Calculate totalBeforeDiscount once for the entire order
    const totalBeforeDiscount = order.dealerGroups.reduce((sum, dg) => {
        return sum + dg.items.reduce((s, item) => {
            const price = item.discountPrice ?? item.price;
            return s + price * item.quantity;
        }, 0);
    }, 0);

 // Calculate dealerTotal and dealerCouponDiscount
    const { dealerTotal, calculatedDiscount } = filteredDealerGroups.reduce((acc, dealerGroup) => {
            const dealerAmount = dealerGroup.items.reduce((sum, item) => {
                const price = item.discountPrice ?? item.price;
                return sum + (price * item.quantity);
            }, 0);

            let currentDealerCouponDiscount = 0;
            if (order.coupon && totalBeforeDiscount > 0) {
                currentDealerCouponDiscount = (dealerAmount / totalBeforeDiscount) * (order.coupon.discountValue || 0);
            }
                     
            const netDealerAmount = dealerAmount - currentDealerCouponDiscount ;
            
            return {
                dealerTotal: acc.dealerTotal + netDealerAmount,
                calculatedDiscount: acc.calculatedDiscount + currentDealerCouponDiscount,
            };
        }, { dealerTotal: 0, calculatedDiscount: 0});

    // Update state with the calculated discount
    useEffect(() => {
      setDealerCouponDiscount(calculatedDiscount);
    }, [calculatedDiscount]);
    
    const dealerProvidedDiscount = filteredDealerGroups.reduce((acc, group) => {
        const groupSavings = group.items.reduce((itemAcc, item) => {
            const savings = (item.price ?? 0) - (item.discountPrice ?? item.price ?? 0);
            return itemAcc + (savings * item.quantity);
        }, 0);
        return acc + groupSavings;
    }, 0);

        // This calculates the total for the dealer before any discounts are applied
        const dealerAmount = filteredDealerGroups.reduce((acc, group) => {
            return acc + group.items.reduce((sum, item) => {
                const priceToUse = item.price;
                return sum + priceToUse * item.quantity;
            }, 0);
        }, 0);


    // === JSX Render ===
    return (
        <div className="order-card">

            {/* Collapsed Section */}
            <div className="card-collapsed-content" onClick={() => toggleExpanded(order._id)}>
                <div className="header-details">
                    <span className="od-shipping-to">
                        Shipping to: <strong>{order.shippingAddress.to}</strong>
                    </span>
                    <div className="his-order-id">
                        <span>Order ID: {order._id}</span>
                        <button className="copy-btn" onClick={(e) => handleCopy(e, order._id)}>
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <rect x="13" y="9" fill="none" stroke="#000" strokeWidth="2" width="14" height="18" />
                                <polyline fill="none" stroke="#000" strokeWidth="2" points="11,23 5,23 5,5 19,5 19,7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="his-order-summary-collapsed">
                    <div className="his-product-images-preview">
                        {allProductImages.map(img => <img key={img.key} src={img.src} alt="Product" />)}
                    </div>
                    <div className="his-summary-text">
                        <span className="overall-status">Status: {order.overallStatus}</span>
                       {userRole==="user" &&(                
                        <span className="grand-total-collapsed">Price : Rs. {order.grandTotal.toFixed(2)}</span>
                        )}
                        {isDealerOrAdmin&&(
                        <span className="grand-total-collapsed">Price : Rs. {Math.round(dealerTotal)}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Section */}
            {isExpanded && (
                <div className="his-card-expanded-content">

                    {/* Shipping Address */}
                    <div className="shipping-address-details">
                        <h4>Shipping Address</h4>
                        <p>{order.shippingAddress.to}</p>
                        <p>{order.shippingAddress.door_no}, {order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                        <p>Contact: {order.shippingAddress.contactNo}</p>
                    </div>

                    {/* Dealer Groups */}
                    {filteredDealerGroups.map((group, gIndex) => {
                        const dealerAmount = group.items.reduce((sum, item) => {
                            const priceToUse = item.discountPrice ?? item.price;
                            return sum + priceToUse * item.quantity;
                        }, 0);

                        let dealerCouponDiscount = 0;
                        if (order.coupon && order.coupon.discountValue && totalBeforeDiscount > 0) {
                            dealerCouponDiscount = (dealerAmount / totalBeforeDiscount) * order.coupon.discountValue;
                        }



                        const dealerGroupTotal = dealerAmount - dealerCouponDiscount ;
                        
                        

                        return (
                            <div key={`${order._id}-g${gIndex}`} className="dealer-group">

                                {/* Dealer Header */}
                                
                                <div className="dealer-header">
                                    {userRole === 'user' && (
                                    <h3>Seller : {group.dealerDetails?.firstName || 'Deleted'} {group.dealerDetails?.lastName || ''}</h3>
                                    )}
                                    {isDealerOrAdmin && group.status === 'Out for Delivery' ? (
                                        <div className="pin-input-section">
                                            <p className="dealer-pin-text">Delivery PIN:</p>
                                            <input
                                                type="text"
                                                placeholder="ENTER PIN TO CONFIRM"
                                                value={pinInput}
                                                onChange={(e) => setPinInput(e.target.value)}
                                            />
                                            <button
                                                className='confirm-delivery-btn'
                                                onClick={() => handleDeliver(order._id, group.dealerId, pinInput)}
                                                disabled={pinInput.length < 4 || isPinSubmitting}
                                            >
                                                {isPinSubmitting ? 'Verifying...' : 'Confirm Delivery'}
                                            </button>
                                        </div>
                                    ) : isDealerOrAdmin && group.status !== 'Delivered' && group.status !== 'Cancelled' ? (
                                        <div className="status-action-section">
                                            <select
                                                value={pendingStatusChange?.newStatus || group.status}
                                                onChange={(e) => handleStatusChangeWithConfirmation(e, group.dealerId)}
                                                className="status-dropdown"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Packed">Packed</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Out for Delivery">Out for Delivery</option>
                                            </select>
                                            <button
                                                className="cancel-btn-dropdown"
                                                onClick={() => {
                                                    setPendingStatusChange({
                                                        orderId: order._id,
                                                        dealerId: group.dealerId,
                                                        newStatus: 'Cancelled',
                                                        reason: ''
                                                    });
                                                    setShowConfirmPopup(true);
                                                }}
                                            >
                                                Cancel Order
                                            </button>
                                        </div>
                                    ) : (
                                        <p className={`dealer-status ${group.status === 'Cancelled' ? 'cancelled-color' : ''}`}>
                                            Status: <span className='dealer-status-con'>{group.status}</span>
                                        </p>
                                    )}
                                </div>
                                
                                {/* Cancelled Reason */}
                                {group.status === 'Cancelled' && (
                                    <div className="cancellation-reason cancelled-color">
                                        <p>
                                            {userRole === 'user'
                                                ? "This order has been cancelled by the dealer."
                                                : group.cancellation_mess || "You cancelled this order."}
                                        </p>
                                    </div>
                                )}

                                {/* Dealer Total */}
                                {userRole === 'user' && (
                                    <p className="dealer-total-user">
                                        Total for this Seller: <span className='dealer-total-user-price'>Rs. {Math.round(dealerGroupTotal)}</span>
                                    </p>
                                )}
                                {userRole === 'user' && group.status === 'Out for Delivery' && group.delivery_pin && (
                                        <div className="delivery-pin-section">
                                            <p className="dealer-pin-text">Delivery PIN: <strong>{group.delivery_pin}</strong></p>
                                        </div>
                                    )}
                                {/* Status Bar */}
                                <div
                                    className={group.status === 'Cancelled' ? "status-bar status-bar-cancelled" : "status-bar"}
                                    style={{ '--progress-width': group.status === 'Cancelled' ? '100%' : getProgressWidth(group.status) }}
                                >
                                    {(group.status === 'Cancelled'
                                        ? ["Pending", "Cancelled"]
                                        : ["Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"])
                                        .map(status => (
                                            <div key={`${order._id}-g${gIndex}-s${status}`}>
                                                {renderStatus(status, group.status)}
                                            </div>
                                        ))}
                                </div>

                                {/* Product List */}
                                <ul className="products-list">
                                    {group.items.map((item, iIndex) => (
                                        <li key={item._id || `${order._id}-g${gIndex}-i${iIndex}`}>
                                            <img src={item.product?.imageUrl || placeholderImage} alt={item.product?.name || 'Deleted product'} />
                                            <div className="his-product-details">
                                                <p className="product-name">{item.product?.name || 'Deleted product'}</p>
                                                <p className="product-variant">{item.variant.weight} {item.variant.unit}</p>
                                                <p className="his-product-price">
                                                    {item.discountPrice != null && item.discountPrice < item.price ? (
                                                        <>
                                                        <span style={{ textDecoration: 'line-through', marginRight: '5px', color: '#888' }}>
                                                            Rs. {item.price.toFixed(2)}
                                                        </span>
                                                        <span>
                                                            Rs. {item.discountPrice.toFixed(2)}
                                                        </span>
                                                        </>
                                                    ) : (
                                                        <span>
                                                        Rs. {item.price.toFixed(2)}
                                                        </span>
                                                    )}
                                                     &nbsp;✖ {item.quantity}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}

                    {/* Price Summary */}
                    <div className="his-price-summary">
                        <h4>Price Details</h4>
                        {userRole==='dealer'&&(
                        <p><span>Calculated Amount<br></br>(Total Sales):</span><span style={{color:"green",fontWeight:"bolder",fontSize:"large"}}><br></br>Rs. {dealerAmount}</span></p>
                        )}
                        {userRole==='user'&&(
                        <p><span>Subtotal:</span><span style={{color:"forestgreen",fontWeight:"bolder",fontSize:"larger"}}>Rs. {Math.round(order.itemsSubtotal)}</span></p>
                        )}
                        {userRole === 'dealer' && dealerProvidedDiscount > 0 && (
                            <p className="total-savings">
                                <span>Total Discount Provided By You:</span>
                                <span style={{color:"red",fontSize:"large"}}>- Rs. {Math.round(dealerProvidedDiscount)}</span>
                            </p>
                        )}
                        {userRole==='user'&& order.totalSavings>0 && (
                        <p className="total-savings"><span>Total Savings:</span><span style={{color:"#28a745",fontSize:"large"}}>- Rs. {Math.round(order.totalSavings)}</span></p>
                        )}
                        {userRole !== 'dealer' && order.couponDiscount > 0 && (
                            <p className="coupon-discount"><span>Coupon Discount 🏷️ :</span><span style={{color:"#e74c3c",fontSize:"large"}}>- Rs. {Math.round(order.couponDiscount)}</span></p>
                        )}
                        {userRole === 'dealer' && (
                            <div>
                                {dealerCouponDiscount > 0 && (
                                    <p><span>Handled By Admin: </span><span style={{color:"tomato",fontSize:"larger"}}>-Rs.{Math.round(dealerCouponDiscount)}</span></p>
                                )}
                            </div>
                        )}
                        {order.deliveryCharge > 0 ? (
                        <>
                            <p>
                            <span>Delivery Charge:</span>
                            <span style={{color:"red",fontWeight:"bolder",fontSize:"large"}}>+ Rs. {Math.round(order.deliveryCharge)}</span>
                            </p>
                            <hr />
                        </>
                        ) : (
                        <p className="delivery-charge free-delivery-charge">
                            <span style={{color:'green'}}>Free Delivery Applied ᯓ⛟ </span>
                        </p>
                        )}
                        {userRole === 'user' ? (
                         <div className='dealer-wise-amount'>
                            <h1 style={{color:"maroon",fontSize:"large",fontWeight:"bolder",textAlign:"center",borderBottom:"1px solid maroon"}}>Seller Wise Denomination</h1>
                            {filteredDealerGroups.map((group, gIndex) => {
                                // Calculate the total for this dealer group before any discounts
                                const dealerAmount = group.items.reduce((sum, item) => {
                                    const priceToUse = item.discountPrice ?? item.price;
                                    return sum + priceToUse * item.quantity;
                                }, 0);

                                // Assuming `order` is in scope, calculate the total before discounts for the entire order
                                const totalBeforeDiscount = order.dealerGroups.reduce((sum, dg) => {
                                    return sum + dg.items.reduce((s, item) => {
                                        const price = item.discountPrice ?? item.price;
                                        return s + price * item.quantity;
                                    }, 0);
                                }, 0);

                                let dealerCouponDiscount = 0;
                                // Check if a coupon was applied and the total is greater than zero
                                if (order.coupon && order.coupon.discountValue && totalBeforeDiscount > 0) {
                                    dealerCouponDiscount = (dealerAmount / totalBeforeDiscount) * order.coupon.discountValue;
                                }

                                // The final total for this dealer group after the proportional discount
                                const dealerGroupTotal = dealerAmount - dealerCouponDiscount;

                                return (
                                        <p key={`${order._id}-summary-${gIndex}`}>
                                            <span style={{color:"maroon",fontWeight:"bolder",fontSize:"large"}}>{group.dealerDetails?.firstName || 'Deleted'} {group.dealerDetails?.lastName || ''}:</span>
                                            <span style={{color:"maroon",fontWeight:"bolder",fontSize:"larger"}}>Rs. {Math.round(dealerGroupTotal)}</span>
                                        </p>
                                    
                                );
                            })}{order.deliveryCharge > 0 &&(<p><span></span><span>Plus Delivery Charges</span></p>)}</div>
                        ) : (
                            <p className="his-grand-total-summary"><span style={{fontSize:"large"}}>Your Total Revenue:</span><span style={{color:"darkgreen",fontSize:"x-large"}}>Rs. {Math.round(dealerTotal)}</span></p>
                        )}
                        {userRole !== 'dealer' && (
                            <p className="his-grand-total-summary" style={{color:"#2c3e50",fontSize:"x-large"}}><span>Grand Total:</span><span style={{color:"darkgreen",fontSize:"x-large"}}>Rs. {Math.round(order.grandTotal)}</span></p>
                        )}
                    </div>
                     {userRole == 'dealer' && dealerCouponDiscount>0 && (
                        <>
                    <p className='note-marker'><mark>&#9432; Note: The amount handled by <strong>Admin</strong> will be settled once the order is delivered</mark></p>
                    <p className='note-marker'><strong>Reason : Since the Customer is used the Coupon for purchase.So,the amount will be settled By Admin Team.</strong></p>
                        </>
                    )}
                    {/* Timestamps */}
                    <div className="order-timestamps">
                        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                        <p><strong>Order Placed On:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                </div>
            )}

            {/* Confirmation & Cancellation Popups */}
            {showConfirmPopup && pendingStatusChange && pendingStatusChange.newStatus !== 'Cancelled' && (
                <div className="popup-overlay">
                    <div className="cancellation-popup">
                        <h3>Confirm Status Change</h3>
                        <p>Are you sure you want to change status to <strong>{pendingStatusChange.newStatus}</strong>?</p>
                        <div className="cancellation-actions">
                            <button className="cancel-btn" onClick={cancelAction}>Cancel</button>
                            <button className="confirm-btn" onClick={confirmAction}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmPopup && pendingStatusChange?.newStatus === 'Cancelled' && (
                <div className="popup-overlay">
                    <div className="cancellation-popup">
                        <h3>Cancel Order</h3>
                        <textarea
                            placeholder="Enter cancellation reason"
                            value={pendingStatusChange.reason || ''}
                            onChange={(e) => setPendingStatusChange({ ...pendingStatusChange, reason: e.target.value })}
                        />
                        <p style={{ fontSize: '12px', color: '#555', marginBottom: '0.5rem' }}>
                            SEND A VALID MESSAGE FOR THE ADMIN TEAM
                        </p>
                        <div className="cancellation-actions">
                            <button className="cancel-btn" onClick={cancelAction}>Cancel</button>
                            <button
                                className="confirm-btn"
                                onClick={confirmAction}
                                disabled={(pendingStatusChange.reason?.split(/\s+/).length || 0) < 10}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OrderCard;
