import React, { useState } from "react";


export default function AccountSettings({ user, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    displayName: user.displayName || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
    country: user.country || ""
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function startEditing() {
    setForm({
      displayName: user.displayName || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      country: user.country || ""
    });
    setEditing(true);
  }

  function save() {
    if (!form.displayName) return alert("Display name no puede estar vacío");
    onSave(form);
    setEditing(false);
  }

  return (
    <div className="card p-3">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Configuración de cuenta</h3>
        {!editing ? (
          <button className="btn btn-outline-primary" onClick={startEditing}>Editar perfil</button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline-secondary" onClick={() => setEditing(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={save}>Guardar</button>
          </div>
        )}
      </div>

      <div className="mt-3">
        <label className="form-label">Display name</label>
        {!editing ? (
          <div className="readonly-field">{form.displayName}</div>
        ) : (
          <input className="form-control" name="displayName" value={form.displayName} onChange={handleChange} />
        )}
      </div>

      <div className="row mt-2">
        <div className="col">
          <label className="form-label">Nombre</label>
          {!editing ? (
            <div className="readonly-field">{form.firstName}</div>
          ) : (
            <input className="form-control" name="firstName" value={form.firstName} onChange={handleChange} />
          )}
        </div>
        <div className="col">
          <label className="form-label">Apellido</label>
          {!editing ? (
            <div className="readonly-field">{form.lastName}</div>
          ) : (
            <input className="form-control" name="lastName" value={form.lastName} onChange={handleChange} />
          )}
        </div>
      </div>

      <div className="row mt-2">
        <div className="col">
          <label className="form-label">Teléfono</label>
          {!editing ? (
            <div className="readonly-field">{form.phone}</div>
          ) : (
            <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
          )}
        </div>
        <div className="col">
          <label className="form-label">País</label>
          {!editing ? (
            <div className="readonly-field">{form.country}</div>
          ) : (
            <input className="form-control" name="country" value={form.country} onChange={handleChange} />
          )}
        </div>
      </div>
    </div>
  );
}
