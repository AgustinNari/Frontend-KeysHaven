import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div data-bs-theme="dark" className="bg-body text-body min-vh-100">
      <div className="container-fluid d-flex flex-column align-items-center justify-content-center min-vh-100">
            {/* Card de login */}
            <div className="card w-50 shadow-lg border-secondary">
              <div className="card-body p-5">
                <h2 className="card-title text-primary text-center mb-4 fw-bold">Iniciar Sesion</h2>
                
                {/* Formulario de email */}
                <div className="mb-4">
                  
                  <div className="form-floating m-1">
                    <input 
                      type="email" 
                      className="form-control bg-dark border-secondary text-white" 
                      id="emailInput"
                      placeholder="Email address"
                    />
                    <label htmlFor="emailInput" className="text-muted">Email address</label>
                  </div>

                  <div className="form-floating m-1">
                    <input 
                      type="password" 
                      className="form-control bg-dark border-secondary text-white" 
                      id="passwordInput"
                      placeholder="Password"
                    />
                    <label htmlFor="passwordInput" className="text-muted">Password</label>
                  </div>
                </div>

                {/* Botón continuar */}
                <button className="btn btn-primary btn-lg w-100 py-2 fw-bold mb-4">
                  Continuar
                </button>

                {/* Texto de términos */}
                <p className="text-muted small text-center">
                  Al continuar aceptas nuestros{' '}
                  <Link to="/terms" className="text-primary text-decoration-none">Terminos y Condiciones</Link>{' '}
                  y nuestras{' '}
                  <Link to="/privacy" className="text-primary text-decoration-none">Politicas de Privacidad</Link>.
                </p>

              </div>

            </div>

            {/* Enlace de registro */}
            <div className="text-center mt-4 d-flex flex-column">
              <p className="text-muted">
                ¿No tienes una cuenta?{' '}
                <div><Link to="/register" className="text-primary text-decoration-none fw-bold">
                  Registrate
                </Link></div>
              </p>
            </div>
      </div>
    </div>
  );
}