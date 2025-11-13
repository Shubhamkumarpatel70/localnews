import React from "react";
import "./PopupModal.css";

const PopupModal = ({ message, onConfirm, onCancel, showConfirmButton }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="popup-modal-overlay">
      <div className="popup-modal-content">
        <p>{message}</p>
        <div className="popup-modal-buttons">
          {showConfirmButton && (
            <button className="confirm-button" onClick={onConfirm}>
              Confirm
            </button>
          )}
          <button className="cancel-button" onClick={onCancel}>
            {showConfirmButton ? "Cancel" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
