import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const out = await login({ email, password });
      if (out.success) {
        navigate("/", { replace: true });
      } else {
        setError(out.error?.message || "Email o contraseña inválidos");
      }
    } catch (err) {
      setError(err?.message || "Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div data-bs-theme="dark" className="bg-primary-dark text-body d-flex justify-content-center align-items-center">
      <div className="container-fluid d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div className="card w-50 shadow-lg border-secondary">
          <div className="card-body p-5">
            <h2 className="card-title text-primary text-center mb-4 fw-bold">Iniciar Sesión</h2>

            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <div className="form-floating m-1">
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control bg-dark border-secondary text-white" id="emailInput" placeholder="Email address" />
                  <label htmlFor="emailInput" className="text-muted">Dirección de Email</label>
                </div>

                <div className="form-floating m-1">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="form-control bg-dark border-secondary text-white" id="passwordInput" placeholder="Password" />
                  <label htmlFor="passwordInput" className="text-muted">Contraseña</label>
                </div>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <button type="submit" className="btn btn-primary btn-lg w-100 py-2 fw-bold mb-4" disabled={submitting}>
                {submitting ? "Iniciando..." : "Continuar"}
              </button>

              <p className="text-muted small text-center">
                Al continuar aceptas nuestros{' '}
                <Link to="/terms" className="text-primary text-decoration-none">Términos y Condiciones</Link>{' '}
                y nuestras{' '}
                <Link to="/privacy" className="text-primary text-decoration-none">Políticas de Privacidad</Link>.
              </p>
            </form>
          </div>
        </div>

        <div className="text-center mt-4 d-flex flex-column">
          <div className="text-muted">
            ¿No tienes una cuenta?{' '}
            <div><Link to="/register" className="text-primary text-decoration-none fw-bold">Regístrate</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}
