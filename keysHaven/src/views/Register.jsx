import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { registerThunk, selectAuthLoading, selectAuthError, selectIsAuthenticated } from "../redux/slices/authSlice";
import { validations, validationMessages } from "../utils/validations";

const DRAFT_KEY = "register_form_draft_v1";

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const loading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [step, setStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [sellerDescription, setSellerDescription] = useState("");
  const [role, setRole] = useState("BUYER");

  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d) {
          if (d.displayName) setDisplayName(d.displayName);
          if (d.email) setEmail(d.email);
          if (d.firstName) setFirstName(d.firstName);
          if (d.lastName) setLastName(d.lastName);
          if (d.phone) setPhone(d.phone);
          if (d.country) setCountry(d.country);
          if (d.sellerDescription) setSellerDescription(d.sellerDescription);
          if (["BUYER", "SELLER"].includes(d.role)) setRole(d.role);
          if (d.termsAccepted) setTermsAccepted(Boolean(d.termsAccepted));
          if (d.step) setStep(d.step);
        }
      }
    } catch (err) {
      console.warn("No se pudo restaurar draft:", err);
    }
  }, []);

  useEffect(() => {
    if (location.state?.termsAccepted) {
      setTermsAccepted(true);
      try {
        window.history.replaceState({}, document.title);
      } catch { /* History may be unavailable; keep the accepted terms. */ }
    }
  }, [location.state]);

  useEffect(() => {
    try {
      const draft = {
        step,
        termsAccepted,
        displayName,
        email,
        firstName,
        lastName,
        phone,
        country,
        sellerDescription,
        role
      };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (err) {
      console.warn("No se pudo guardar draft:", err);
    }
  }, [step, termsAccepted, displayName, email, password, firstName, lastName, phone, country, sellerDescription, role]);

  function validateStep1() {
    const newErrors = {};

    if (!displayName.trim()) {
      newErrors.displayName = "El nombre de usuario es requerido";
    }

    if (!email) {
      newErrors.email = "El email es requerido";
    } else if (!validations.email(email)) {
      newErrors.email = validationMessages.email;
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (!validations.password(password)) {
      newErrors.password = validationMessages.password;
    }

    if (!termsAccepted) {
      newErrors.terms = "Debes aceptar los términos y condiciones";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep2() {
    const newErrors = {};

    if (firstName && !validations.onlyText(firstName)) {
      newErrors.firstName = validationMessages.onlyText;
    }

    if (lastName && !validations.onlyText(lastName)) {
      newErrors.lastName = validationMessages.onlyText;
    }

    if (phone && !validations.phone(phone)) {
      newErrors.phone = validationMessages.phone;
    }

    if (country && !validations.onlyText(country)) {
      newErrors.country = validationMessages.onlyText;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function onContinue() {
    setLocalError(null);
    if (!validateStep1()) {
      if (!termsAccepted) {
        setLocalError("Debes aceptar los Términos y Condiciones para continuar.");
      } else {
        setLocalError("Completa nombre, email y contraseña (min 8 caracteres).");
      }
      return;
    }
    setStep(2);
  }

  function onBackToStep1() {
    setLocalError(null);
    setStep(1);
  }

  const handleTermsRedirect = () => {
    try {
      const draft = {
        step,
        termsAccepted,
        displayName,
        email,
        firstName,
        lastName,
        phone,
        country,
        sellerDescription,
        role
      };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (err) {
      console.warn("Error al persistir draft antes de ir a términos:", err);
    }

    navigate("/termsandconditions", {
      state: { from: "register" }
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* Storage may be unavailable; continue to the home page. */ }
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);

    if (!validateStep2()) {
      setSubmitting(false);
      return;
    }

    const payload = {
      displayName,
      firstName,
      lastName,
      email,
      password,
      role,
      phone: phone || null,
      sellerDescription: sellerDescription || null,
      country: country || null,
    };

    try {
      const resultAction = await dispatch(registerThunk(payload));
      if (!registerThunk.fulfilled.match(resultAction)) {
        const payloadErr = resultAction.payload || resultAction.error;
        setLocalError(payloadErr?.message || payloadErr?.error?.message || 'Error al registrarse');
      }
    } catch (err) {
      setLocalError(err?.message || 'Error en el servidor');
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
                      className={`form-control bg-dark border-secondary text-white ${errors.displayName ? 'is-invalid' : ''}`}
                      id="displayNameInput"
                      placeholder="Nombre de usuario"
                    />
                    <label htmlFor="displayNameInput" className="text-muted">Nombre para mostrar *</label>
                    {errors.displayName && <div className="invalid-feedback">{errors.displayName}</div>}
                  </div>

                  <div className="form-floating m-1">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className={`form-control bg-dark border-secondary text-white ${errors.email ? 'is-invalid' : ''}`}
                      id="emailInput"
                      placeholder="Email address"
                    />
                    <label htmlFor="emailInput" className="text-muted">Dirección de Email *</label>
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="form-floating m-1">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className={`form-control bg-dark border-secondary text-white ${errors.password ? 'is-invalid' : ''}`}
                      id="passwordInput"
                      placeholder="Password"
                    />
                    <label htmlFor="passwordInput" className="text-muted">Contraseña (mín 8 caracteres) *</label>
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    <div className="form-text text-muted">
                      La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número
                    </div>
                  </div>

                  <div className="mt-4 p-3 border rounded bg-dark">
                    <div className="form-check">
                      <input
                        className={`form-check-input ${errors.terms ? 'is-invalid' : ''}`}
                        type="checkbox"
                        id="termsCheck"
                        checked={termsAccepted}
                        onChange={() => setTermsAccepted(!termsAccepted)}
                      />
                      <label className="form-check-label text-light" htmlFor="termsCheck">
                        He leído y acepto los Términos y Condiciones *
                      </label>
                      {errors.terms && <div className="invalid-feedback d-block">{errors.terms}</div>}
                    </div>

                    <div className="mt-3 d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleTermsRedirect}
                      >
                        <i className="fas fa-external-link-alt me-2"></i>
                        Leer Términos y Condiciones
                      </button>
                    </div>

                    {termsAccepted && (
                      <div className="alert alert-success mt-3 mb-0 py-2 small" role="alert">
                        <i className="fas fa-check-circle me-2"></i>
                        Términos y condiciones aceptados correctamente
                      </div>
                    )}
                  </div>
                </div>

                {(localError || authError) && <div className="alert alert-danger">{localError || authError?.message || authError}</div>}

                <button
                  className="btn btn-primary btn-lg w-100 py-2 fw-bold mb-4"
                  onClick={onContinue}
                >
                  Continuar
                </button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={onSubmit}>
                <div className="row g-2 mb-3">
                  <div className="col">
                    <div className="form-floating">
                      <input 
                        value={firstName} 
                        onChange={(e)=>setFirstName(e.target.value)} 
                        className={`form-control bg-dark border-secondary text-white ${errors.firstName ? 'is-invalid' : ''}`} 
                        placeholder="Nombre" 
                      />
                      <label className="text-muted">Nombre</label>
                      {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-floating">
                      <input 
                        value={lastName} 
                        onChange={(e)=>setLastName(e.target.value)} 
                        className={`form-control bg-dark border-secondary text-white ${errors.lastName ? 'is-invalid' : ''}`} 
                        placeholder="Apellido" 
                      />
                      <label className="text-muted">Apellido</label>
                      {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                    </div>
                  </div>
                </div>

                <div className="form-floating mb-2">
                  <input 
                    value={phone} 
                    onChange={(e)=>setPhone(e.target.value)} 
                    className={`form-control bg-dark border-secondary text-white ${errors.phone ? 'is-invalid' : ''}`} 
                    placeholder="Teléfono" 
                  />
                  <label className="text-muted">Teléfono</label>
                  {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  <div className="form-text text-muted">Formato: +54 11 1234-5678</div>
                </div>

                <div className="form-floating mb-2">
                  <input 
                    value={country} 
                    onChange={(e)=>setCountry(e.target.value)} 
                    className={`form-control bg-dark border-secondary text-white ${errors.country ? 'is-invalid' : ''}`} 
                    placeholder="País" 
                  />
                  <label className="text-muted">País</label>
                  {errors.country && <div className="invalid-feedback">{errors.country}</div>}
                </div>

                <div className="form-floating mb-2">
                  <textarea 
                    value={sellerDescription} 
                    onChange={(e)=>setSellerDescription(e.target.value)} 
                    className="form-control bg-dark border-secondary text-white" 
                    rows="2" 
                    placeholder="Descripción (si sos seller)">
                  </textarea>
                  <label className="text-muted">Descripción de vendedor (opcional)</label>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Seleccionar rol</label>
                  <select className="form-select" value={role} onChange={(e)=>setRole(e.target.value)}>
                    <option value="BUYER">Buyer</option>
                    <option value="SELLER">Seller</option>
                  </select>
                </div>

                {(localError || authError) && <div className="alert alert-danger">{localError || authError?.message || authError}</div>}

                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-secondary flex-grow-1" onClick={onBackToStep1} disabled={submitting || loading}>
                    Volver
                  </button>
                  <button type="submit" className="btn btn-primary flex-grow-1" disabled={submitting || loading}>
                    {submitting || loading ? "Registrando..." : "Registrar y Entrar"}
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
