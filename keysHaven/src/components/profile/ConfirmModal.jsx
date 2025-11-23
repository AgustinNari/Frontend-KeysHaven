import React from "react";
import PropTypes from "prop-types";

export default function ConfirmModal({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}) {
  if (!show) return null;

  const backdropStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    position: "fixed",
    inset: 0,
    overflowY: "auto",
    zIndex: 1800
  };

  const modalStyle = {
    width: "100%",
    maxWidth: 520,
    maxHeight: "20vh",
    overflowY: "auto",
    borderRadius: 10,
    padding: 18,
    boxSizing: "border-box"
  };

  return (
    <div
      className="modal-backdrop-fixed"
      style={backdropStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel && onCancel();
      }}
      role="presentation"
    >
      <div
        className="confirm-modal card"
        style={modalStyle}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h4>{title}</h4>
        <p style={{ color: "#e6dbff" }}>{message}</p>

        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-outline-secondary" onClick={() => onCancel && onCancel()}>
            {cancelText}
          </button>

          <button className="btn btn-danger" onClick={() => onConfirm && onConfirm()}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmModal.propTypes = {
  show: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string
};
