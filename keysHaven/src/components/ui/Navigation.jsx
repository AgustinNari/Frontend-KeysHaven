import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import "../estilos/Fondos.css";
//const active = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';

export default function Navigation() {
  return (
    /*<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container app-container d-flex justify-content-between align-items-center">
        <Link className="navbar-brand" to="/">KeysHaven</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><NavLink to="/home" className={active}>Home</NavLink></li>
            <li className="nav-item"><NavLink to="/catalog" className={active}>Catálogo</NavLink></li>
            <li className="nav-item"><NavLink to="/cart" className={active}>Carrito</NavLink></li>
            <li className="nav-item"><NavLink to="/login" className={active}>Login</NavLink></li>
            <li className="nav-item"><NavLink to="/register" className={active}>Registro</NavLink></li>
          </ul>
        </div>
      </div>
    </nav>*/
    <nav className="navbar navbar-expand-lg sticky-top  navbar-dark bg-primary-dark">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img src="/src/assets/keyLogo.svg" width={55} height={35} />
            KeysHaven</Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#nav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div id="nav" className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto me-3">
              <li className="nav-item"><NavLink to="/catalog" className="nav-link">Catálogo</NavLink></li>
              <li className="nav-item"><NavLink to="/cart" className="nav-link">Carrito</NavLink></li>
              <li className="nav-item"><NavLink to="/login" className="nav-link">Login</NavLink></li>
              <li className="nav-item"><NavLink to="/register" className="nav-link">Registro</NavLink></li>
            </ul>
            <div className="d-flex gap-2">
              <NavLink to="/cart" className="nav-link"> 
                <button className="btn btn-outline-primary rounded-circle p-2">
                <span className="material-symbols-outlined">shopping_cart</span>
                </button>
              </NavLink>
              <button className="btn btn-outline-secondary rounded-circle p-2">
                <span className="material-symbols-outlined">person</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
  );
}
