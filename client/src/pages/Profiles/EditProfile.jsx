import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Pofilescss/editProfile.css";

const EditProfile = ({ showFlash }) => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState(
    storedUser || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
      dob: "",
      role: "user",
      addresses: [
        {
          type: "home",
          to:"",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          alt_no:"",
        },
      ],
    }
  );

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !token) return;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const userData = data.user || data;

        if (!userData.addresses || userData.addresses.length === 0) {
          userData.addresses = [
            {
              type: "home",
              to:"",
              street: "",
              city: "",
              state: "",
              postalCode: "",
              country: "",
              alt_no:"",
            },
          ];
        }

        setFormData(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [userId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
const navigate = useNavigate();
  const handleAddressChange = (e, index) => {
    const { name, value } = e.target;
    const updatedAddresses = [...formData.addresses];
    updatedAddresses[index][name] = value;
    setFormData((prev) => ({ ...prev, addresses: updatedAddresses }));
  };

  const handleAddAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          type: "home",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
      ],
    }));
  };

  const handleRemoveAddress = (index) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updatedUser = await res.json();

      localStorage.setItem("user", JSON.stringify(updatedUser.user || updatedUser));
      setFormData(updatedUser.user || updatedUser);

      // ✅ Trigger flash message from App.jsx
      showFlash("Profile updated successfully!", "success");
      navigate(-1); 
    } catch (error) {
      console.error("Error updating user:", error);
      showFlash("Failed to update profile. Try again!", "error");
    }
  };
  return (
    <div className="edit-profile-container">
      <h3>Edit Profile</h3>
      <form id="editor"className="edit-profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email (readonly)</label>
          <input type="email" value={formData.email || ""} readOnly />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Role</label>
          <input
            name="role"
            value={formData.role || "user"}
            readOnly
          ></input>
        </div>

        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={
              formData.dob && !isNaN(new Date(formData.dob))
                ? new Date(formData.dob).toISOString().substring(0, 10)
                : ""
            }
            onChange={handleChange}
          />
        </div>
        {formData.role === 'user' && (
          <>
        <h3>Address</h3>
        {formData.addresses?.map((address, index) => (
          <div key={index} className="address-section">
            <label id="typing">Type</label>
            <select id="addreser"
              name="type"
              value={address.type || "home"}
              onChange={(e) => handleAddressChange(e, index)}
            >
              <option value="home">Home</option>
              <option value="office">Office</option>
              <option value="other">Other</option>
            </select>
            <input required
              type="text"
              name="to"
              placeholder="Deliver To"
              value={address.to || ""}
              onChange={(e) => handleAddressChange(e, index)}
            />
            <input required
              type="text"
              name="door_no"
              placeholder="Door-No"
              value={address.door_no || ""}
              onChange={(e) => handleAddressChange(e, index)}
            />
            <input required
              type="text"
              name="street"
              placeholder="Street"
              value={address.street || ""}
              onChange={(e) => handleAddressChange(e, index)}
            />
            <input required
              type="text"
              name="city"
              placeholder="City"
              value={address.city || ""}
              onChange={(e) => handleAddressChange(e, index)}
            />
            <input required
              type="text"
              name="state"
              placeholder="State"
              value={address.state || ""}
              onChange={(e) => handleAddressChange(e, index)}
            />
            <input  required
              type="text"
              name="postalCode"
              placeholder="Postal Code"
              value={address.postalCode || ""}
              onChange={(e) => handleAddressChange(e, index)}
            />
            <input required
              type="text"
              name="country"
              placeholder="Country"
              value={address.country || ""}
              onChange={(e) => handleAddressChange(e, index)}
            />
            <label id="alt-numb">Alternate Number </label>
            <input
              type="text"
              name="alt_no"
              placeholder="Alternate Number"
              value={address.alt_no || ""}
              onChange={(e) => handleAddressChange(e, index)}
            />

            {/* ❌ Remove Address */}
            {formData.addresses.length > 0 && (
              <button
                type="button"
                className="remove-address-btn"
                onClick={() => handleRemoveAddress(index)}
              >
                ❌ Remove
              </button>
            )}
          </div>
        ))}</>)}

      {formData.role === 'user' && (<>
        {/* ➕ Add Address button */}
        <button
          type="button"
          className="add-address-btn-prof"
          onClick={handleAddAddress}
        >
          + Add Address
        </button></>
      )}
        <button type="submit" className="save-btn">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
