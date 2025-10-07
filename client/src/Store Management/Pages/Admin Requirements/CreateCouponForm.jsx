import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/CreateCouponForm.css';
import FlashMessage from '../../../components/common/FlashMessage';

const CreateCouponForm = ({ editingCoupon, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: 'percentage',
        value: '',
        totalLimit: '',
        perUserLimit: 1,
        minOrderValue: '',
        expiresOn: '',
        isPrivate: false,
        validForUsers: [],
        validFor: {
            product_ids: [],
            category_names: [],
        },
        customRules: {
            partnerName: '',
            discountAmount: '',
            minOrderValue: '', // Added for custom rule type
        },
    });

    const [flash, setFlash] = useState({ message: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    
    // NEW STATE for Product & Category Rules visibility
    const [showProductCategoryRules, setShowProductCategoryRules] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (editingCoupon) {
            setFormData({
                code: editingCoupon.code,
                description: editingCoupon.description,
                type: editingCoupon.type,
                value: editingCoupon.value,
                totalLimit: editingCoupon.usage?.totalLimit,
                perUserLimit: editingCoupon.usage?.perUserLimit || 1,
                minOrderValue: editingCoupon.minOrderValue,
                expiresOn: editingCoupon.expires_on ? new Date(editingCoupon.expires_on).toISOString().split('T')[0] : '',
                isPrivate: editingCoupon.valid_for_users.length > 0,
                validForUsers: editingCoupon.valid_for_users,
                validFor: editingCoupon.valid_for || { product_ids: [], category_names: [] },
                customRules: editingCoupon.customRules || { partnerName: '', discountAmount: '', minOrderValue: '' },
            });
            // Set initial state for checkbox based on existing coupon's valid_for data
            if (editingCoupon.valid_for && (editingCoupon.valid_for.product_ids.length > 0 || editingCoupon.valid_for.category_names.length > 0)) {
                setShowProductCategoryRules(true);
            } else {
                setShowProductCategoryRules(false);
            }
        } else {
            setFormData({
                code: '',
                description: '',
                type: 'percentage',
                value: '',
                totalLimit: '',
                perUserLimit: 1,
                minOrderValue: '',
                expiresOn: '',
                isPrivate: false,
                validForUsers: [],
                validFor: { product_ids: [], category_names: [] },
                customRules: { partnerName: '', discountAmount: '', minOrderValue: '' },
            });
            setShowProductCategoryRules(false); // Default to hidden for new coupon
        }
        setValidationErrors({}); // Clear validation errors on edit/new
    }, [editingCoupon]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'code') {
            setFormData(prev => ({
                ...prev,
                [name]: value.toUpperCase(),
            }));
        } else if (name === 'type') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                // Reset custom rules if changing type away from 'custom'
                customRules: value === 'custom' ? prev.customRules : { partnerName: '', discountAmount: '', minOrderValue: '' },
                // Reset main minOrderValue if changing to 'custom'
                minOrderValue: value === 'custom' ? '' : prev.minOrderValue,
            }));
        } else if (name === 'showProductCategoryRules') { // Handle the new checkbox
            setShowProductCategoryRules(checked);
            if (!checked) {
                // Clear validFor fields when checkbox is unchecked
                setFormData(prev => ({
                    ...prev,
                    validFor: { product_ids: [], category_names: [] },
                }));
            }
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleValidForChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            validFor: {
                ...prev.validFor,
                [name]: value.split(',').map(item => item.trim()).filter(item => item !== ''),
            },
        }));
    };

    const handleCustomRulesChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            customRules: {
                ...prev.customRules,
                [name]: value,
            },
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.code) errors.code = 'Coupon code is required.';
        if (!formData.description) errors.description = 'Description is required.';
        if (formData.perUserLimit <= 0) errors.perUserLimit = 'Per-user limit must be at least 1.';

        if (formData.type === 'custom') {
            if (!formData.customRules.partnerName) errors.partnerName = 'Partner name is required for custom coupons.';
            if (!formData.customRules.discountAmount || formData.customRules.discountAmount <= 0) errors.discountAmount = 'Custom discount amount must be a positive number.';
            if (!formData.customRules.minOrderValue || formData.customRules.minOrderValue < 0) errors.minOrderValue = 'Minimum order value is required for custom coupons.';
        } else {
            if (!formData.value || formData.value <= 0) errors.value = 'Discount value must be a positive number.';
            if (formData.minOrderValue < 0) errors.minOrderValue = 'Minimum order value cannot be negative.';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setFlash({ message: 'Please fix the form errors.', type: 'error' });
            return;
        }
        
        setFlash({ message: '', type: '' });
        setIsSubmitting(true);
        setValidationErrors({}); // Clear errors before submission

        const couponData = {
            code: formData.code,
            description: formData.description,
            type: formData.type,
            // Use customRules values for 'custom' type, otherwise main values
            value: formData.type === 'custom' ? Number(formData.customRules.discountAmount) : Number(formData.value),
            minOrderValue: formData.type === 'custom' ? Number(formData.customRules.minOrderValue) : Number(formData.minOrderValue),
            expires_on: formData.expiresOn ? new Date(formData.expiresOn) : undefined,
            usage: {
                totalLimit: formData.totalLimit === '' ? null : Number(formData.totalLimit),
                perUserLimit: Number(formData.perUserLimit),
            },
            valid_for_users: formData.isPrivate ? formData.validForUsers : [],
            // Only send valid_for if the checkbox is checked
            valid_for: showProductCategoryRules ? formData.validFor : { product_ids: [], category_names: [] },
            customRules: formData.type === 'custom' ? { 
                partnerName: formData.customRules.partnerName, 
                discountAmount: Number(formData.customRules.discountAmount),
                minOrderValue: Number(formData.customRules.minOrderValue),
            } : undefined, // Ensure customRules is undefined if not 'custom' type
        };
        
        try {
            if (editingCoupon) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/admin/coupons/${editingCoupon._id}`,
                    couponData,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                setFlash({ message: `Coupon "${couponData.code}" updated successfully!`, type: 'success' });
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/admin/coupons`,
                    couponData,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                setFlash({ message: `Coupon "${couponData.code}" created successfully!`, type: 'success' });
            }

            
            if (onSuccess) {
                setTimeout(onSuccess, 1500);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || `Failed to ${editingCoupon ? 'update' : 'create'} coupon.`;
            setFlash({ message: errorMessage, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="coupon-form-container">
            {flash.message && <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash({ message: '', type: '' })} />}
            <h2 className="form-title">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="code">Coupon Code</label>
                    <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        readOnly={!!editingCoupon}
                        style={{ textTransform: 'uppercase' }}
                    />
                    {validationErrors.code && <p className="error-text">{validationErrors.code}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        required
                    ></textarea>
                    {validationErrors.description && <p className="error-text">{validationErrors.description}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="type">Discount Type</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                    >
                        <option value="percentage">Percentage Off</option>
                        <option value="fixed_amount">Fixed Amount Off</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                {formData.type === 'custom' ? (
                    <div className="custom-rules-section">
                        <h3 className="section-title">Custom Rules (for partner offers)</h3>
                        <div className="form-group">
                            <label htmlFor="partnerName">Partner Name</label>
                            <input
                                type="text"
                                id="partnerName"
                                name="partnerName"
                                value={formData.customRules.partnerName}
                                onChange={handleCustomRulesChange}
                                placeholder="e.g., Paytm"
                            />
                            {validationErrors.partnerName && <p className="error-text">{validationErrors.partnerName}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="customRulesMinOrderValue">Minimum Order Value (₹)</label>
                            <input
                                type="number"
                                id="customRulesMinOrderValue"
                                name="minOrderValue"
                                value={formData.customRules.minOrderValue}
                                onChange={handleCustomRulesChange}
                                placeholder="Required for custom coupons"
                            />
                            {validationErrors.minOrderValue && <p className="error-text">{validationErrors.minOrderValue}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="discountAmount">Custom Discount Amount</label>
                            <input
                                type="number"
                                id="discountAmount"
                                name="discountAmount"
                                value={formData.customRules.discountAmount}
                                onChange={handleCustomRulesChange}
                                placeholder="e.g., 50 (for ₹50 off)"
                            />
                            {validationErrors.discountAmount && <p className="error-text">{validationErrors.discountAmount}</p>}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="form-group">
                            <label htmlFor="value">
                                {formData.type === 'percentage' ? 'Percentage Value (%)' : 'Fixed Amount Value (₹)'}
                            </label>
                            <input
                                type="number"
                                id="value"
                                name="value"
                                value={formData.value}
                                onChange={handleChange}
                                required
                            />
                            {validationErrors.value && <p className="error-text">{validationErrors.value}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="minOrderValue">Minimum Order Value (₹)</label>
                            <input
                                type="number"
                                id="minOrderValue"
                                name="minOrderValue"
                                value={formData.minOrderValue}
                                onChange={handleChange}
                            />
                            {validationErrors.minOrderValue && <p className="error-text">{validationErrors.minOrderValue}</p>}
                        </div>
                    </>
                )}
                <div className="form-group">
                    <label htmlFor="expiresOn">Expiration Date</label>
                    <input
                        type="date"
                        id="expiresOn"
                        name="expiresOn"
                        value={formData.expiresOn}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="totalLimit">Total Usage Limit</label>
                    <input
                        type="number"
                        id="totalLimit"
                        name="totalLimit"
                        value={formData.totalLimit}
                        onChange={handleChange}
                        placeholder="Leave blank for unlimited"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="perUserLimit">Per-User Usage Limit</label>
                    <input
                        type="number"
                        id="perUserLimit"
                        name="perUserLimit"
                        value={formData.perUserLimit}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                    {validationErrors.perUserLimit && <p className="error-text">{validationErrors.perUserLimit}</p>}
                </div>
                <div className="form-group-checkbox">
                    <input
                        type="checkbox"
                        id="isPrivate"
                        name="isPrivate"
                        checked={formData.isPrivate}
                        onChange={handleChange}
                    />
                    <label htmlFor="isPrivate">Make this a private coupon (for specific users)</label>
                </div>
                {formData.isPrivate && (
                    <div className="private-coupon-note">
                        <p>You would add a component here to search for and select users. The selected user IDs would be added to the `validForUsers` array.</p>
                    </div>
                )}

                {/* NEW CHECKBOX for Product & Category Rules */}
                <div className="form-group-checkbox">
                    <input
                        type="checkbox"
                        id="showProductCategoryRules"
                        name="showProductCategoryRules"
                        checked={showProductCategoryRules}
                        onChange={handleChange}
                    />
                    <label htmlFor="showProductCategoryRules">Add Product/Category Specific Rules</label>
                </div>

                {showProductCategoryRules && (
                    <div className="valid-for-section">
                        <h3 className="section-title">Product & Category Rules</h3>
                        <p className="section-description">This coupon will only be valid for the items specified below. Leave blank to apply to all products/categories.</p>
                        <div className="form-group">
                            <label htmlFor="product_ids">Product IDs</label>
                            <input
                                type="text"
                                id="product_ids"
                                name="product_ids"
                                value={formData.validFor.product_ids.join(', ')}
                                onChange={handleValidForChange}
                                placeholder="Enter product IDs, separated by commas"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category_names">Category Names</label>
                            <input
                                type="text"
                                id="category_names"
                                name="category_names"
                                value={formData.validFor.category_names.join(', ')}
                                onChange={handleValidForChange}
                                placeholder="Enter category names, separated by commas"
                            />
                        </div>
                    </div>
                )}

                <div className="button-group">
                    <button type="submit" className="coup-submit-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-button" disabled={isSubmitting}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCouponForm;