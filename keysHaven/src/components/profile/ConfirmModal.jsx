import React from "react";
import PropTypes from "prop-types";

export default function ConfirmModal({ show, title, message, onConfirm, onCancel, confirmText = "Confirmar", cancelText = "Cancelar" }) {
  if (!show) return null;
  return (
    <div className="modal-backdrop-fixed">
      <div className="confirm-modal card">
        <h4>{title}</h4>
        <p style = {{ color: "#e6dbff" }}>{message}</p>
        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-outline-secondary" onClick={onCancel}>{cancelText}</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>
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
  onCancel: PropTypes.func
};
