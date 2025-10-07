import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./css/ProductEditForm.css";
import { useNavigate } from 'react-router-dom';

const ProductEditForm = ({ product, onUpdate, showFlash }) => {
  const additionalImagesRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    brand: "",
    tags: "",
    isFeatured: false,
    isNewArrival: false,
    organic: false,
    expiryDate: "",
    shelfLife: "",
    popularityScore: 0,
    dealerId: "",
  });

  const [dealerName, setDealerName] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]); // ✅ NEW: State to track images to delete
  const [variants, setVariants] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        description: product.description || "",
        brand: product.brand || "",
        tags: product.tags?.join(", ") || "",
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false,
        organic: product.organic || false,
        expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : "",
        shelfLife: "",
        popularityScore: product.popularityScore || 0,
        dealerId: product.dealerId || "",
      });
      setMainImage(null);
      setMainImagePreview(product.imageUrl || null);
      setAdditionalImages([]);
      setAdditionalPreviews(product.images || []);
      setImagesToDelete([]); // ✅ NEW: Reset on product change
      setVariants(product.variants || []);
    }
    
    // ✅ FIX: Prioritize the dealer's name from the product prop
    if (product && product.dealerId && typeof product.dealerId === 'object') {
      setDealerName(`${product.dealerId.firstName} ${product.dealerId.lastName}`);
    } else {
      // Fallback to localStorage for the current user
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user._id) {
          const fullName = `${user.firstName} ${user.lastName}`;
          setDealerName(fullName.trim());
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        setDealerName("Unknown Dealer");
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCustomButtonClick = () => {
    additionalImagesRef.current.click();
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveMainImage = () => {
    setMainImage(null);
    setMainImagePreview(null);
  };

  const handleAdditionalImagesChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setAdditionalImages((prev) => [...prev, ...newFiles]);
    setAdditionalPreviews((prev) => [...prev, ...newFiles.map(file => URL.createObjectURL(file))]);
    e.target.value = null;
  };

  const handleRemoveAdditionalImage = (index) => {
    const previewToRemove = additionalPreviews[index];
    
    // Check if the removed preview is a new file or an old URL
    const isNewFile = additionalImages.some(file => URL.createObjectURL(file) === previewToRemove);

    if (isNewFile) {
        // Find the index of the file in the additionalImages array and remove it
        const newFileIndex = additionalImages.findIndex(file => URL.createObjectURL(file) === previewToRemove);
        if (newFileIndex > -1) {
            const updatedNewImages = additionalImages.filter((_, i) => i !== newFileIndex);
            setAdditionalImages(updatedNewImages);
        }
    } else {
        // It's an old image URL, so add it to the imagesToDelete array
        setImagesToDelete((prev) => [...prev, previewToRemove]);
    }
    
    // Always remove the preview from the display
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { weight: "", unit: "g", price: "", discountPrice: "", stock: "" },
    ]);
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  const handleRemoveVariant = (index) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(updatedVariants);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsLoading(true);

    const data = new FormData();
    
    // Append form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== false && value !== null && value !== '') {
        data.append(key, value);
      }
    });

    // Append images to delete
    if (imagesToDelete.length > 0) {
      data.append("imagesToDelete", JSON.stringify(imagesToDelete));
    }

    // Append new images
    if (mainImage) data.append("image", mainImage);
    additionalImages.forEach((img) => data.append("images", img));

    // Append variants
    const cleanedVariants = variants.filter(
      (v) => v.weight && v.price && v.stock
    );
    if (cleanedVariants.length > 0) {
      data.append("variants", JSON.stringify(cleanedVariants));
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/products/${product._id}`,
        data, {
          headers: {
            'Content-Type': 'multipart/form-data',
             Authorization: `Bearer ${token}`,
          },
        }
      );
      showFlash("Product updated successfully! ✅", "success");
      onUpdate();
    } catch (err) {
      console.error('Errror is',err);
      const errorMessage = err.response?.data?.error || "Error updating product";
      showFlash(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h3 className="form-title">Edit Product</h3>
      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Dealer</label>
          <input
            type="text"
            value={dealerName || "Loading..."}
            disabled
            className="disabled-input"
          />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Fruits">Fruits</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Dairy">Dairy</option>
            <option value="Bakery">Bakery</option>
            <option value="Snacks">Snacks</option>
            <option value="Beverages">Beverages</option>
            <option value="Household">Household</option>
          </select>
        </div>
        {formData.category && (
          <div className="form-group">
            {["Fruits", "Vegetables"].includes(formData.category) ? (
              <>
                <label>Shelf Life (days)</label>
                <input
                  type="number"
                  name="shelfLife"
                  value={formData.shelfLife}
                  onChange={handleChange}
                />
              </>
            ) : (
              <>
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </>
            )}
          </div>
        )}
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
          />
        </div>
        <div className="form-checkboxes">
          <label>
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
            />
            Featured
          </label>
          <label>
            <input
              type="checkbox"
              name="isNewArrival"
              checked={formData.isNewArrival}
              onChange={handleChange}
            />
            New Arrival
          </label>
          <label>
            <input
              type="checkbox"
              name="organic"
              checked={formData.organic}
              onChange={handleChange}
            />
            Organic
          </label>
        </div>
        <div className="form-group">
          <label>Popularity Score</label>
          <input
            type="number"
            name="popularityScore"
            value={formData.popularityScore}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Main Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleMainImageChange}
          />
          {mainImagePreview && (
            <div className="image-preview-wrapper">
              <img
                src={mainImagePreview}
                alt="Main Preview"
                className="image-preview"
              />
              <button
                type="button"
                className="image-delete-btn"
                onClick={handleRemoveMainImage}
              >
                ×
              </button>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Additional Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleAdditionalImagesChange}
            ref={additionalImagesRef}
            className="hidden-file-input"
          />
          <div className="file-input-container">
            <button
              type="button"
              onClick={handleCustomButtonClick}
              className="custom-file-button"
            >
              Choose Files
            </button>
            <span className="file-count">{additionalImages.length} new file(s) chosen</span>
          </div>
          <div className="images-preview-container">
            {additionalPreviews.map((src, i) => (
              <div key={i} className="image-preview-wrapper">
                <img
                  src={src}
                  alt={`Preview ${i}`}
                  className="image-preview"
                />
                <button
                  type="button"
                  className="image-delete-btn"
                  onClick={() => handleRemoveAdditionalImage(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="variants-section">
          <h3>Variants</h3>
          {variants.map((variant, index) => (
            <div key={index} className="variant-row">
              <input
                type="number"
                placeholder="Weight"
                value={variant.weight || ""}
                onChange={(e) =>
                  handleVariantChange(index, "weight", e.target.value)
                }
                required
              />
              <select
                value={variant.unit || "g"}
                onChange={(e) =>
                  handleVariantChange(index, "unit", e.target.value)
                }
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="L">L</option>
                <option value="piece">Piece</option>
                <option value="dozen">dozen</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={variant.price || ""}
                onChange={(e) =>
                  handleVariantChange(index, "price", e.target.value)
                }
                required
              />
              <input
                type="number"
                placeholder="Discount Price"
                value={variant.discountPrice || ""}
                onChange={(e) =>
                  handleVariantChange(index, "discountPrice", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Stock"
                value={variant.stock || ""}
                onChange={(e) =>
                  handleVariantChange(index, "stock", e.target.value)
                }
                required
              />
              <button
                type="button"
                className="remove-variant-btn"
                onClick={() => handleRemoveVariant(index)}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="add-variant-btn"
            onClick={handleAddVariant}
          >
            + Add Variant
          </button>
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Updating Product..." : "Update Product"}
          </button>
          <button type="button" className="cancel-btn" onClick={() => onUpdate()}>
            Cancel
          </button>
        </div>
      </form>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p> &#9888; Updating product... This may take a moment.</p>
        </div>
      )}
    </div>
  );
};

export default ProductEditForm;