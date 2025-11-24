import React, { useState } from "react";
import { validations, validationMessages } from "../../utils/validations";

export default function AccountSettings({ user, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    displayName: user.displayName || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
    country: user.country || ""
  });
  
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (editing) {
      validateField(name, value);
    }
  }

  function validateField(name, value) {
    const newErrors = { ...errors };
    
    switch (name) {
      case "phone":
        if (value && !validations.phone(value)) {
          newErrors.phone = validationMessages.phone;
        } else {
          delete newErrors.phone;
        }
        break;
        
      case "country":
        if (value && !validations.onlyText(value)) {
          newErrors.country = validationMessages.onlyText;
        } else {
          delete newErrors.country;
        }
        break;
        
      case "firstName":
      case "lastName":
        if (value && !validations.onlyText(value)) {
          newErrors[name] = validationMessages.onlyText;
        } else {
          delete newErrors[name];
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  }

  function validateForm() {
    const newErrors = {};
    
    if (!form.displayName.trim()) {
      newErrors.displayName = "El nombre de usuario es requerido";
    }
    
    if (form.phone && !validations.phone(form.phone)) {
      newErrors.phone = validationMessages.phone;
    }
    
    if (form.country && !validations.onlyText(form.country)) {
      newErrors.country = validationMessages.onlyText;
    }
    
    if (form.firstName && !validations.onlyText(form.firstName)) {
      newErrors.firstName = validationMessages.onlyText;
    }
    
    if (form.lastName && !validations.onlyText(form.lastName)) {
      newErrors.lastName = validationMessages.onlyText;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function startEditing() {
    setForm({
      displayName: user.displayName || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      country: user.country || ""
    });
    setErrors({});
    setEditing(true);
  }

  function save() {
    if (!validateForm()) {
      alert("Por favor corrige los errores antes de guardar");
      return;
    }
    
    if (!form.displayName) {
      alert("Display name no puede estar vacío");
      return;
    }
    
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
        <label className="form-label">Display name *</label>
        {!editing ? (
          <div className="readonly-field">{form.displayName}</div>
        ) : (
          <>
            <input 
              className={`form-control ${errors.displayName ? 'is-invalid' : ''}`} 
              name="displayName" 
              value={form.displayName} 
              onChange={handleChange} 
            />
            {errors.displayName && <div className="invalid-feedback">{errors.displayName}</div>}
          </>
        )}
      </div>

      <div className="row mt-2">
        <div className="col">
          <label className="form-label">Nombre</label>
          {!editing ? (
            <div className="readonly-field">{form.firstName}</div>
          ) : (
            <>
              <input 
                className={`form-control ${errors.firstName ? 'is-invalid' : ''}`} 
                name="firstName" 
                value={form.firstName} 
                onChange={handleChange} 
              />
              {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
            </>
          )}
        </div>
        <div className="col">
          <label className="form-label">Apellido</label>
          {!editing ? (
            <div className="readonly-field">{form.lastName}</div>
          ) : (
            <>
              <input 
                className={`form-control ${errors.lastName ? 'is-invalid' : ''}`} 
                name="lastName" 
                value={form.lastName} 
                onChange={handleChange} 
              />
              {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
            </>
          )}
        </div>
      </div>

      <div className="row mt-2">
        <div className="col">
          <label className="form-label">Teléfono</label>
          {!editing ? (
            <div className="readonly-field">{form.phone}</div>
          ) : (
            <>
              <input 
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`} 
                name="phone" 
                value={form.phone} 
                onChange={handleChange}
                placeholder="+54 11 1234-5678"
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </>
          )}
        </div>
        <div className="col">
          <label className="form-label">País</label>
          {!editing ? (
            <div className="readonly-field">{form.country}</div>
          ) : (
            <>
              <input 
                className={`form-control ${errors.country ? 'is-invalid' : ''}`} 
                name="country" 
                value={form.country} 
                onChange={handleChange} 
              />
              {errors.country && <div className="invalid-feedback">{errors.country}</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}