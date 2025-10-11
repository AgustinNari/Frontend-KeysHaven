import React from 'react';

export default function Login() {
  return (
    <div>
      <h2>Login</h2>
      <div className="full-height d-flex flex-column align-items-center justify-content-center">
      <p className="text-muted">Formulario de login (placeholder).</p>

      <div className="card p-3" style={{ maxWidth: '40%' }}>
        <label className="form-label">Email</label>
        <input className="form-control mb-2" placeholder="usuario@mail.com" />
        <label className="form-label">Contraseña</label>
        <input className="form-control mb-3" type="password" />
        <button className="btn btn-primary">Ingresar (demo)</button>
      </div>
      </div>
    </div>
  );
}
