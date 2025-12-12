import React from "react";

const PopupModal = ({ message, onConfirm, onCancel, showConfirmButton }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full z-10">
        <p className="text-gray-900 mb-6 text-center">{message}</p>
        <div className="flex gap-3 justify-end">
          {showConfirmButton && (
            <button
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
              onClick={onConfirm}
            >
              Confirm
            </button>
          )}
          <button
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
            onClick={onCancel}
          >
            {showConfirmButton ? "Cancel" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
