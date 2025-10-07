import React, { useState, useEffect, useCallback } from 'react';
import OrderCard from './OrderCard';
import axios from 'axios';
import FlashMessage from '../../components/common/FlashMessage';
import RouteLoader from '../../components/common/RouteLoader';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [flash, setFlash] = useState({ show: false, message: '', type: '' });
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [userRole, setUserRole] = useState(null);

    const showFlashMessage = useCallback((message, type = 'error') => {
        setFlash({ show: true, message, type });
        setTimeout(() => setFlash({ show: false, message: '', type: '' }), 3000);
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            if (!token || !storedUser) {
                setError("Please log in to view your order history.");
                setLoading(false);
                return;
            }

            const parsedUser = JSON.parse(storedUser);
            setUserRole(parsedUser.role);

            const url = `${import.meta.env.VITE_API_URL}/api/orders/myorders`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (Array.isArray(response.data)) {
                // Flatten dealerGroups items to include product images for user
                const userOrders = response.data.map(order => {
                    const allItems = order.dealerGroups.flatMap(group => group.items);
                    const allProductImages = allItems.map(item => item.product ? item.product.imageUrl : null).filter(Boolean);                    return { ...order, allItems, allProductImages };
                });

                setOrders(userOrders);
            } else {
                setError("Received invalid data from the server.");
                console.error("API response was not an array:", response.data);
                setOrders([]);
            }
        } catch (e) {
            setError("Failed to fetch order history. Please log in again.");
            console.error("Error fetching orders:", e);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [showFlashMessage]);

    const toggleExpanded = (orderId) => {
        setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
    };

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    if (loading) {
            <RouteLoader/>
        return <div className="loading-state">Loading your order history...</div>;
    };
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="order-history-page">
            {flash.show && (
                <FlashMessage
                    message={flash.message}
                    type={flash.type}
                    onClose={() => setFlash({ ...flash, show: false })}
                />
            )}
            <h1 className="or-page-title">My Orders</h1>
            {orders.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't placed any orders yet. Start shopping now!</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <OrderCard 
                            key={order._id}
                            order={order}
                            userRole={userRole}
                            showFlashMessage={showFlashMessage}
                            isExpanded={expandedOrderId === order._id}
                            toggleExpanded={toggleExpanded}
                            // Remove dealer-specific props
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
