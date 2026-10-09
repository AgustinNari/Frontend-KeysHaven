import { localizeErrorMessage } from '../../utils/displayText';
import React, { useState, useEffect } from "react";
import ConfirmModal from "./ConfirmModal";

export default function ChangePasswordModal({ show, onClose, onChangePassword }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!show) {
      setForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setError("");
      setShowConfirm(false);
    }
  }, [show]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  function validateAndConfirm() {
    if (!form.currentPassword) return setError("Ingresa tu contraseña actual.");
    if (form.newPassword.length < 8) return setError("La nueva contraseña debe tener al menos 8 caracteres.");
    if (form.newPassword !== form.confirmNewPassword) return setError("Las contraseñas nuevas no coinciden.");
    setShowConfirm(true);
  }

  function handleConfirmChange() {
    setShowConfirm(false);
    onChangePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword
    });
    setForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    onClose && onClose();
  }

  if (!show) return null;

  const backdropStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    position: "fixed",
    inset: 0,
    overflowY: "auto",
    zIndex: 1500
  };

  const dialogStyle = {
    width: "100%",
    maxWidth: 560,
    maxHeight: "36vh",
    overflowY: "auto",
    borderRadius: 10,
    padding: 20,
    boxSizing: "border-box"
  };

  return (
    <div
      className="modal-backdrop-fixed"
      style={backdropStyle}
      onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}
      role="presentation"
    >
      <div className="confirm-modal card" style={dialogStyle} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h4 style={{ marginTop: 0 }}>Cambiar contraseña</h4>
        <p style={{ color: "#e6dbff" }} className="text small">Ingresa tu contraseña actual y la nueva (dos veces).</p>

        <div className="mt-2">
          <label className="form-label">Contraseña actual</label>
          <input name="currentPassword" type="password" className="form-control" value={form.currentPassword} onChange={handleChange} />
        </div>

        <div className="mt-2">
          <label className="form-label">Nueva contraseña</label>
          <input name="newPassword" type="password" className="form-control" value={form.newPassword} onChange={handleChange} />
        </div>

        <div className="mt-2">
          <label className="form-label">Confirmar nueva contraseña</label>
          <input name="confirmNewPassword" type="password" className="form-control" value={form.confirmNewPassword} onChange={handleChange} />
        </div>

        {error && <div className="mt-2" style={{ color: "#ffb4d2" }}>{localizeErrorMessage(error)}</div>}

        <div className="mt-3 d-flex gap-2 justify-content-end">
          <button className="btn btn-outline-secondary" onClick={() => onClose && onClose()}>Cancelar</button>
          <button className="btn btn-danger" onClick={validateAndConfirm}>Cambiar contraseña</button>
        </div>

        <ConfirmModal
          show={showConfirm}
          title="Confirmar cambio de contraseña"
          message="¿Deseas cambiar tu contraseña ahora? Se te pedirá autenticación la próxima vez que inicies sesión."
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmChange}
          confirmText="Sí, cambiar"
        />
      </div>
    </div>
  );
}
