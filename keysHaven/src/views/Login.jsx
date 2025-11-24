import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { loginThunk, selectAuthLoading, selectAuthError, selectIsAuthenticated } from "../redux/slices/authSlice";
import { validations, validationMessages } from "../utils/validations";


export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  
  function validateForm() {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = "El email es requerido";
    } else if (!validations.email(email)) {
      newErrors.email = validationMessages.email;
    }
    
    if (!password) {
      newErrors.password = "La contraseña es requerida";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLocalError(null);

    if (!validateForm()) {
      return;
    }
    

    if (!email || !password) {
      setLocalError("Completa email y contraseña");
      return;
    }

    try {
      const resultAction = await dispatch(loginThunk({ email, password }));
      if (loginThunk.fulfilled.match(resultAction)) {
        navigate("/", { replace: true });
      } else {
        const payload = resultAction.payload || resultAction.error;
        setLocalError(payload?.message || payload?.error?.message || "Email o contraseña inválidos");
      }
    } catch (err) {
      setLocalError(err?.message || "Error de conexión");
    }
  }

  const submitDisabled = loading;

  return (
    <div data-bs-theme="dark" className="bg-primary-dark text-body d-flex justify-content-center align-items-center">
      <div className="container-fluid d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div className="card w-50 shadow-lg border-secondary">
          <div className="card-body p-5">
            <h2 className="card-title text-primary text-center mb-4 fw-bold">Iniciar Sesión</h2>

            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <div className="form-floating m-1">
                  <input 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    type="email" 
                    className={`form-control bg-dark border-secondary text-white ${errors.email ? 'is-invalid' : ''}`} 
                    id="emailInput" 
                    placeholder="Email address" 
                  />
                  <label htmlFor="emailInput" className="text-muted">Dirección de Email</label>
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
                  <label htmlFor="passwordInput" className="text-muted">Contraseña</label>
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
              </div>

              {(localError || authError) && <div className="alert alert-danger">{localError || authError?.message || authError}</div>}

              <button type="submit" className="btn btn-primary btn-lg w-100 py-2 fw-bold mb-4" disabled={submitDisabled}>
                {submitDisabled ? "Iniciando..." : "Continuar"}
              </button>

              <p className="text-muted small text-center">
                Al continuar aceptas nuestros{" "}
                <Link
                  to="/termsandconditions"
                  className="text-primary text-decoration-none"
                >
                  Términos y Condiciones
                </Link>{" "}
                y nuestras{" "}
                <Link
                  to="/privacy"
                  className="text-primary text-decoration-none"
                >
                  Políticas de Privacidad
                </Link>.
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
