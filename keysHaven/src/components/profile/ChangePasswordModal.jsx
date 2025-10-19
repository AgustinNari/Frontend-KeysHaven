import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal";

export default function ChangePasswordModal({ show, onClose, onChangePassword }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

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
    onClose();
  }

  if (!show) return null;
  return (
    <div className="modal-backdrop-fixed">
      <div className="confirm-modal card">
        <h4>Cambiar contraseña</h4>
        <p className="text-muted">Ingresa tu contraseña actual y la nueva (dos veces).</p>

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

        {error && <div className="mt-2" style={{ color: "#ffb4d2" }}>{error}</div>}

        <div className="mt-3 d-flex gap-2 justify-content-end">
          <button className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={validateAndConfirm}>Cambiar contraseña</button>
        </div>
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
  );
}
