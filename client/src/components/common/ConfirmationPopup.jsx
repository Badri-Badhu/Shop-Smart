import React from 'react';
import './ConfirmationPopup.css';

// Added a new prop: confirmText with a default value of 'Confirm'
const ConfirmationPopup = ({ message, onConfirm, onCancel, confirmText = 'Confirm' }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <p className="popup-message">{message}</p>
        <div className="popup-actions">
          <button className="popup-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="popup-confirm-btn" onClick={onConfirm}>
            {/* Use the prop for the button text */}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;