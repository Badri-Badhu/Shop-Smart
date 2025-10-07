import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateCouponForm from './CreateCouponForm';
import ConfirmationPopup from "../../../components/common/ConfirmationPopup";
import './css/CreateCouponForm.css';
import RouteLoader from '../../../components/common/RouteLoader';
import ErrorPage from '../../../components/Handlers/ErrorPage';
import FlashMessage from '../../../components/common/FlashMessage';
const CouponManager = () => {
    const [coupons, setCoupons] = useState([]);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [showPopup, setShowPopup] = useState(null);
    const token=localStorage.getItem('token');
    const [flash, setFlash] = useState({ message: "", type: "" });
    const showFlash = (message, type) => {
        setFlash({ message, type });
      };

const fetchCoupons = async () => {
    try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/allcoupons`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const { role, coupons: couponList } = response.data;

        // Optional: check if backend explicitly returns user role
        if (role !== 'admin') {
            setCoupons([]); // clear state
            showFlash('Access denied. Admin privileges required.', 'error');
        } else {
            setCoupons(couponList); // only set if admin
        }

        setLoading(false);
    } catch (err) {
        console.error(err);
        setCoupons([]); // always clear coupons on error
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            showFlash('Access denied. Admin privileges required.', 'error');
        } else {
            setError('Failed to fetch coupons. Please check the server connection.');
        }
        setLoading(false);
    }
};

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setViewMode('form');
    };

    const handleDelete = (couponId) => {
        setShowPopup({
            message: 'Are you sure you want to delete this coupon?',
            id: couponId
        });
    };

    const handleConfirmDelete = async () => {
        const token = localStorage.getItem('token'); // get token
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/admin/coupons/${showPopup.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` } // include token
                }
            );
            setCoupons(coupons.filter(coupon => coupon._id !== showPopup.id));
            setShowPopup(null);
            setFlash({ message: 'Coupon deleted successfully!', type: 'success' });
        } catch (err) {
            console.error(err);
            setShowPopup(null);
            const errorMessage = err.response?.data?.message || 'Failed to delete coupon. Please try again.';
            setFlash({ message: errorMessage, type: 'error' });
        }
    };



    const handleCancelDelete = () => {
        setShowPopup(null);
    };

    const handleFormSuccess = () => {
        setEditingCoupon(null);
        setViewMode('list');
        fetchCoupons();
    };

    const handleCancel = () => {
        setEditingCoupon(null);
        setViewMode('list');
    };

    return (
        <div className="coupon-manager-container">
        {flash.message && (
            <FlashMessage
                message={flash.message}
                type={flash.type}
                onClose={() => setFlash({ message: '', type: '' })}
            />
        )}
            <h1 className="main-title">Coupon Management</h1>
            {viewMode === 'list' ? (
                <div className="list-view">
                    <div className="list-header">
                        <h2 className="list-title" >Existing Coupons</h2>
                        <button onClick={() => setViewMode('form')} className="add-coupon-button">
                            + Add New Coupon
                        </button>
                    </div>
                    {loading ? (
                        <RouteLoader/>
                    ) : error ? (
                        <ErrorPage 
                            title="Failed to Load Coupons" 
                            message="There was an error connecting to the server. Please check your internet connection and try again."
                        />
                    ) : coupons.length === 0 ? (
                        <p className="empty-list-message">No coupons found. Click "Add New Coupon" to get started!</p>
                    ) : (
                        <ul className="coupon-list">
                            {coupons.map((coupon) => (
                                <li key={coupon._id} className="coupon-item">
                                    <div className="coupon-details">
                                        <div className="coupon-code-and-status">
                                            <span className="coupon-code">{coupon.code}</span>
                                            <span className={`coupon-status ${coupon.status.toLowerCase()}`}>{coupon.status}</span>
                                        </div>
                                        <p className="coupon-description">{coupon.description}</p>
                                        <p className="coupon-info">Type: {coupon.type}</p>
                                    </div>
                                    <div className="coupon-actions">
                                        <button onClick={() => handleEdit(coupon)} className="edit-button">Edit</button>
                                        <button onClick={() => handleDelete(coupon._id)} className="delete-button">Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <div className="form-view">
                    <CreateCouponForm 
                        editingCoupon={editingCoupon}
                        onSuccess={handleFormSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            )}

            {showPopup && (
                <ConfirmationPopup
                    message={showPopup.message}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
};

export default CouponManager;