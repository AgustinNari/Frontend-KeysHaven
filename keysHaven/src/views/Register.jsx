import React from 'react';

export default function Register() {
  return (
    <div>
      <h2>Registro</h2>
      <div className="full-height d-flex flex-column align-items-center justify-content-center">
      <p className="text-muted">Formulario de registro (placeholder).</p>

      <div className="card p-3" style={{ maxWidth: '50%' }}>
        <input className="form-control mb-2" placeholder="Nombre" />
        <input className="form-control mb-2" placeholder="Apellido" />
        <input className="form-control mb-2" placeholder="Email" />
        <input className="form-control mb-3" placeholder="Contraseña" type="password" />
        <button className="btn btn-primary">Registrarse (demo)</button>
      </div>
      </div>
    </div>
  );
}
