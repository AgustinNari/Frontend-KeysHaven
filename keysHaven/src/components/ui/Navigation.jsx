import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const active = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';

export default function Navigation() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
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
    </nav>
  );
}
