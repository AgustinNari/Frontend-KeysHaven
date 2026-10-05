import bundledAsset0 from "../../assets/keyLogo.svg";
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-top py-5 bg-primary-mid text-light">
      <div className="container app-container text-center">
        <div className="row g-4">
          <div className="col-md-3">
            <Link
              to="/"
              className="d-flex align-items-center gap-2 mb-3 text-decoration-none text-light"
            >
              <img src={bundledAsset0} width={55} height={50} />
              <strong>KeysHaven</strong>
            </Link>
            <small className="text-light">
              © {new Date().getFullYear()} KeysHaven. Todos los derechos
              reservados.
            </small>
          </div>

          <div className="col-md-2">
            <h6 className="fw-bold">Soporte</h6>
            <ul className="list-unstyled small">
              <li>
                <Link
                  to="/faq"
                  className="text-light text-decoration-none"
                >
                  Cómo activar tus claves
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-light text-decoration-none"
                >
                  Política de reembolsos
                </Link>
              </li>
              <li>
                <Link
                  to="/help-center"
                  className="text-light text-decoration-none"
                >
                  Centro de ayuda
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-2">
            <h6 className="fw-bold">Compañía</h6>
            <ul className="list-unstyled small">
              <li>
                <Link
                  className="text-light text-decoration-none"
                  to="/about"
                >
                  Sobre KeysHaven
                </Link>
              </li>
              <li>
                <Link
                  className="text-light text-decoration-none"
                  to="/termsandconditions"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  className="text-light text-decoration-none"
                  to="/faq"
                >
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link
                  className="text-light text-decoration-none"
                  to="/privacy"
                >
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
