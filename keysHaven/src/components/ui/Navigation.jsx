import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import "../estilos/Fondos.css";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../store/cart.jsx";

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { items } = useCart();
  const cartCount = items.reduce((acc, it) => acc + (it.qty ?? 0), 0);

  return (
    <nav className="navbar navbar-expand-lg sticky-top navbar-dark bg-primary-dark">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src="/src/assets/keyLogo.svg" width={55} height={35} alt="KeysHaven" />
          KeysHaven
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div id="nav" className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto me-3">
            <li className="nav-item"><NavLink to="/catalog" className="nav-link">Catálogo</NavLink></li>
            <li className="nav-item"><NavLink to="/cart" className="nav-link">Carrito</NavLink></li>

            {!isAuthenticated && (
              <>
                <li className="nav-item"><NavLink to="/login" className="nav-link">Login</NavLink></li>
                <li className="nav-item"><NavLink to="/register" className="nav-link">Registro</NavLink></li>
              </>
            )}

            {isAuthenticated && (
              <>
                {user?.role === "SELLER" && <li className="nav-item"><NavLink to="/sellerdashboard" className="nav-link">Dashboard</NavLink></li>}
                {user?.role === "ADMIN" && <li className="nav-item"><NavLink to="/adminpanel" className="nav-link">Admin</NavLink></li>}
              </>
            )}
          </ul>

          <div className="d-flex gap-2 align-items-center">
            <NavLink to="/cart" className="nav-link">
              <button className="btn btn-outline-primary rounded-circle p-2 position-relative">
                <span className="material-symbols-outlined">shopping_cart</span>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </button>
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className="nav-link" title="Perfil">
                  <button className="btn btn-outline-secondary rounded-circle p-2">
                    <span className="material-symbols-outlined">person</span>
                  </button>
                </NavLink>

                
                <div style={{color : "#7f13ec"}}>
                  {user?.displayName ?? user?.email}
                </div>

                
                <button className="btn btn-outline-danger rounded-circle p-2" onClick={logout} title="Cerrar sesión">
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </>
            ) : (
              <NavLink to="/login" className="nav-link">
                <button className="btn btn-outline-secondary rounded-circle p-2">
                  <span className="material-symbols-outlined">person</span>
                </button>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
