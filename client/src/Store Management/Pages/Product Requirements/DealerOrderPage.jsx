import React, { useState, useEffect, useCallback } from 'react';
import OrderCard from '../../../pages/order management/OrderCard';
import axios from 'axios';
import FlashMessage from '../../../components/common/FlashMessage';
import RouteLoader from '../../../components/common/RouteLoader';
import ErrorPage from '../../../components/Handlers/ErrorPage';
const DealerOrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [flash, setFlash] = useState({ show: false, message: '', type: '' });
    const [userRole, setUserRole] = useState(null);
    const [loggedInDealerId, setLoggedInDealerId] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const showFlashMessage = useCallback((message, type = 'error') => {
        setFlash({ show: true, message, type });
        const timer = setTimeout(() => setFlash({ show: false, message: '', type: '' }), 3000);
        return () => clearTimeout(timer); // Clean up the timeout
    }, []);

    const fetchDealerOrders = useCallback(async (dealerId, token, userRole) => {
        try {
            const url = `${import.meta.env.VITE_API_URL}/api/orders/dealer`;
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (Array.isArray(response.data)) {
                const filteredOrders = response.data.filter(order => 
                order.dealerGroups.some(group => {
                    const groupDealerId = typeof group.dealerId === 'object' ? group.dealerId._id : group.dealerId;
                    return groupDealerId == dealerId; 
                })
                );

                setOrders(filteredOrders);
            } else {
                setError("Received invalid data from the server.");
                console.error("API response was not an array:", response.data);
                setOrders([]);
            }
        } catch (e) {
            setError("Failed to fetch orders. Please try again.");
            console.error("Error fetching orders:", e);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleStatusChange = useCallback(async (orderId, dealerId, newStatus, reason = '') => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
                { dealerId, newStatus, reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showFlashMessage("Order status updated successfully!", 'success');
            fetchDealerOrders(loggedInDealerId, token, userRole);
        } catch (e) {
            console.error("Failed to update status:", e);
            showFlashMessage("Failed to update status. Please try again.", 'error');
        }
    }, [showFlashMessage, fetchDealerOrders, loggedInDealerId, userRole]);

    const toggleExpanded = useCallback((orderId) => {
        setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
    }, []);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!token || !storedUser) {
            setError("Please log in to view your orders.");
            setLoading(false);
            return;
        }
        
        const parsedUser = JSON.parse(storedUser);
        setLoggedInDealerId(parsedUser._id);
        setUserRole(parsedUser.role);
        fetchDealerOrders(parsedUser._id, token, parsedUser.role);
    }, [fetchDealerOrders]); // This will now run only once on mount

    if (loading) {
        return<RouteLoader/>;}
    if (error) {
        return (
        <ErrorPage 
            title="Failed to Load Products" 
            message="There was an error connecting to the server. Please check your internet connection and try again."
        />
        );
    }    
    return (
        <div className="order-history-page">
            {flash.show && (
                <FlashMessage
                    message={flash.message}
                    type={flash.type}
                    onClose={() => setFlash({ show: false, message: '', type: '' })}
                />
            )}
            <h1 className="or-page-title">Dealer Orders</h1>
            {orders.length === 0 ? (
                <div className="empty-state">
                    <p>You have no orders to fulfill.</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <OrderCard 
                            key={order._id} 
                            order={order} 
                            userRole={userRole}
                            loggedInDealerId={loggedInDealerId}
                            onStatusChange={handleStatusChange}
                            showFlashMessage={showFlashMessage}
                            isExpanded={expandedOrderId === order._id}
                            toggleExpanded={toggleExpanded}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DealerOrderPage;