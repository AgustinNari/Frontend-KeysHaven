import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div data-bs-theme="dark" className="bg-body text-body min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            {/* Header del logo */}
            <div className="text-center mb-5 mt-5">
              <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
                <div className="text-primary">
                </div>
              </div>
            </div>

            {/* Card de login */}
            <div className="card shadow-lg border-secondary">
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

                {/* Separador */}
                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1 border-secondary" />
                </div>

                {/* Botones de redes sociales */}
                <div className="d-grid gap-3">
                  <button className="btn btn-outline-light btn-lg py-2 d-flex align-items-center justify-content-center gap-3">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLZe_RotQvVt4j7popS431C9Qr931kNIOetJGabtn9eO4LPGvfoG--YikzcwmgrRnrH2dVrogbZCFVzC0T_dxgIaELxY_JhinzmnowdOWSo4bd2aEj0JPS5ZipAAWQISCipV7844f3GvIKl884fd5PbFeGQ-COjZyJo1tcI6bouUryro72isfMrNzyqkAHSZ97ezMFBFZSPWlLmgmmYzOAD5D-gWzFAnIrysY6PWJGKKOO11WugAWlZGZXV6nF_-71TRmhtjwO5DI" 
                      alt="Google" 
                      width="24" 
                      height="24"
                    />
                    Continuar con Google
                  </button>

                  <button className="btn btn-outline-light btn-lg py-2 d-flex align-items-center justify-content-center gap-3">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLZe_RotQvVt4j7popS431C9Qr931kNIOetJGabtn9eO4LPGvfoG--YikzcwmgrRnrH2dVrogbZCFVzC0T_dxgIaELxY_JhinzmnowdOWSo4bd2aEj0JPS5ZipAAWQISCipV7844f3GvIKl884fd5PbFeGQ-COjZyJo1tcI6bouUryro72isfMrNzyqkAHSZ97ezMFBFZSPWlLmgmmYzOAD5D-gWzFAnIrysY6PWJGKKOO11WugAWlZGZXV6nF_-71TRmhtjwO5DI" 
                      alt="Twitch" 
                      width="24" 
                      height="24"
                    />
                    Continuar con Twitch
                  </button>
                </div>
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
      </div>
    </div>
  );
}