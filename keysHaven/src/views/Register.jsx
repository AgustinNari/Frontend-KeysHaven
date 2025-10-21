import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";



export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("");


  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [sellerDescription, setSellerDescription] = useState("");
  const [role, setRole] = useState("BUYER"); 

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function validateStep1() {
    if (!displayName || !email || !password) return false;

    if (password.length < 8) return false;
    return true;
  }

  function onContinue() {
    setError(null);
    if (!validateStep1()) {
      setError("Completa nombre, email y contraseña (min 8 caracteres).");
      return;
    }
    setStep(2);
  }

  function onBackToStep1() {
    setError(null);
    setStep(1);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      displayName: displayName,
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      role: role, 
      phone: phone || null,
      sellerDescription: sellerDescription || null,
      country: country || region || null,
    };

    try {
      const out = await register(payload);
      if (out.success) {
        navigate("/", { replace: true });
      } else {
        setError(out.error?.message || "Error al registrarse");
      }
    } catch (err) {
      setError(err?.message || "Error en el servidor");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div data-bs-theme="dark" className="bg-primary-dark text-body d-flex justify-content-center align-items-center">
      <div className="container-fluid d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div className="card w-50 shadow-lg border-secondary">
          <div className="card-body p-5">
            <h2 className="card-title text-primary text-center mb-4 fw-bold">Crear una nueva cuenta</h2>

            {step === 1 && (
              <div>
                <div className="mb-4">
                  <div className="form-floating m-1">
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      type="text"
                      className="form-control bg-dark border-secondary text-white"
                      id="displayNameInput"
                      placeholder="Nombre de usuario"
                    />
                    <label htmlFor="displayNameInput" className="text-muted">Nombre para mostrar</label>
                  </div>

                  <div className="form-floating m-1">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="form-control bg-dark border-secondary text-white"
                      id="emailInput"
                      placeholder="Email address"
                    />
                    <label htmlFor="emailInput" className="text-muted">Dirección de Email</label>
                  </div>

                  <div className="form-floating m-1">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="form-control bg-dark border-secondary text-white"
                      id="passwordInput"
                      placeholder="Password"
                    />
                    <label htmlFor="passwordInput" className="text-muted">Contraseña (mín 8 caracteres)</label>
                  </div>

                  <div className="mx-2 mt-3">
                    <label className="form-label small text-muted">Seleccionar Región (opcional)</label>
                    <select className="form-select" value={region} onChange={(e) => setRegion(e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option>Sudamérica</option>
                      <option>Norteamérica</option>
                      <option>Europa</option>
                      <option>Asia</option>
                    </select>
                  </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <button className="btn btn-primary btn-lg w-100 py-2 fw-bold mb-4" onClick={onContinue}>
                  Continuar
                </button>

                <p className="text-muted small text-center">
                  Al continuar aceptas nuestros{' '}
                  <Link to="/terms" className="text-primary text-decoration-none">Términos y Condiciones</Link>{' '}
                  y nuestras{' '}
                  <Link to="/privacy" className="text-primary text-decoration-none">Políticas de Privacidad</Link>.
                </p>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={onSubmit}>
                <div className="row g-2 mb-3">
                  <div className="col">
                    <div className="form-floating">
                      <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} className="form-control bg-dark border-secondary text-white" placeholder="Nombre" />
                      <label className="text-muted">Nombre</label>
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-floating">
                      <input value={lastName} onChange={(e)=>setLastName(e.target.value)} className="form-control bg-dark border-secondary text-white" placeholder="Apellido" />
                      <label className="text-muted">Apellido</label>
                    </div>
                  </div>
                </div>

                <div className="form-floating mb-2">
                  <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="form-control bg-dark border-secondary text-white" placeholder="Teléfono" />
                  <label className="text-muted">Teléfono</label>
                </div>

                <div className="form-floating mb-2">
                  <input value={country} onChange={(e)=>setCountry(e.target.value)} className="form-control bg-dark border-secondary text-white" placeholder="País" />
                  <label className="text-muted">País</label>
                </div>

                <div className="form-floating mb-2">
                  <textarea value={sellerDescription} onChange={(e)=>setSellerDescription(e.target.value)} className="form-control bg-dark border-secondary text-white" rows="2" placeholder="Descripción (si sos seller)"></textarea>
                  <label className="text-muted">Descripción de vendedor (opcional)</label>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Seleccionar rol</label>
                  <select className="form-select" value={role} onChange={(e)=>setRole(e.target.value)}>
                    <option value="BUYER">Buyer</option>
                    <option value="SELLER">Seller</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-secondary flex-grow-1" onClick={onBackToStep1} disabled={submitting}>
                    Volver
                  </button>
                  <button type="submit" className="btn btn-primary flex-grow-1" disabled={submitting}>
                    {submitting ? "Registrando..." : "Registrar y Entrar"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        <div className="text-center mb-4 d-flex flex-column mt-3">
              <p className="text-muted">¿Ya tienes una cuenta?</p>
          <div>
            <Link to="/login" className="text-primary text-decoration-none fw-bold">Iniciar Sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
