import React from "react";
import { Link, NavLink } from "react-router-dom";
import "../estilos/Fondos.css";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../store/cart.jsx";
import DoppyThumbsUp from "../../assets/doppyKnight/doppyThumbsUp.png";

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { items } = useCart();
  const cartCount = items.reduce((acc, it) => acc + (it.qty ?? 0), 0);

  const briefName = user?.displayName ?? user?.email ?? "";
  const avatar = user?.avatarDataUrl ?? DoppyThumbsUp;

  return (
    <nav className="navbar navbar-expand-lg sticky-top navbar-dark bg-primary-dark border-bottom border-light">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src="/src/assets/keyLogo.svg" width={55} height={35} alt="KeysHaven" />
          KeysHaven
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div id="nav" className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto me-3">
            <li className="nav-item">
              <NavLink to="/catalog" className="nav-link">Catálogo</NavLink>
            </li>

            {!isAuthenticated && (
              <>
                <li className="nav-item"><NavLink to="/login" className="nav-link">Login</NavLink></li>
                <li className="nav-item"><NavLink to="/register" className="nav-link">Registro</NavLink></li>
              </>
            )}

            {isAuthenticated && (
              <>
              </>
            )}
          </ul>

          <div className="d-flex gap-2 align-items-center">
            <NavLink to="/cart" className="nav-link" aria-label="Carrito">
              <button className="btn btn-outline-primary rounded-circle p-2 position-relative" title="Carrito"style={{width:"50px",height:"50px"}}>
                <span className="material-symbols-outlined">shopping_cart</span>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </button>
            </NavLink>

            {isAuthenticated && user?.role === "SELLER" && (
              <NavLink to="/sellerdashboard" className="nav-link" aria-label="Seller dashboard" title="Seller dashboard">
                <button className="btn btn-outline-success rounded-circle p-2" style={{ borderColor: "rgba(90, 200, 150, 0.12)" }}>
                  <span className="material-symbols-outlined">storefront</span>
                </button>
              </NavLink>
            )}

            {isAuthenticated && user?.role === "ADMIN" && (
              <NavLink to="/adminpanel" className="nav-link" aria-label="Admin panel" title="Admin panel">
                <button className="btn btn-outline-warning rounded-circle p-2" style={{ borderColor: "rgba(255,200,0,0.12)" }}>
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                </button>
              </NavLink>
            )}
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className="nav-link" title="Perfil">
                  <button
                  className="btn btn-outline-secondary rounded-circle p-2"
                  style={{
                    background: `url(${avatar})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "100%",
                    backgroundPosition: "center",
                    width: "50px",  // Fixed width
                    height: "50px", // Fixed height
                    padding: "0",    // Remove default padding
                    position: "relative",  // Needed to position the pseudo-element
                    overflow: "hidden", // Hide anything outside the button's borders
                    transition: "background-color 0.3s ease", // Smooth transition for background change
                  }}
                >
                  <span className="button-overlay"></span>  {/* This span will be used for the gloss effect */}
                </button>
                </NavLink>

                <div style={{ color: "#7f13ec", fontWeight: 600 }}>
                  {briefName}
                </div>
                <button
                  className="btn btn-outline-danger rounded-circle p-2"
                  onClick={logout}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </>
            ) : (
              <NavLink to="/login" className="nav-link" aria-label="Iniciar sesión">
                <button
                  className="btn btn-outline-secondary rounded-circle p-2"
                  style={{
                    background: `url(${avatar})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "100%",
                    backgroundPosition: "center",
                    width: "50px",  // Fixed width
                    height: "50px", // Fixed height
                    padding: "0",    // Remove default padding
                    position: "relative",  // Needed to position the pseudo-element
                    overflow: "hidden", // Hide anything outside the button's borders
                    transition: "background-color 0.3s ease", // Smooth transition for background change
                  }}
                >
                  <span className="button-overlay"></span>  {/* This span will be used for the gloss effect */}
                </button>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
/*<img
                    src={avatar}
                    alt="Avatar"
                    className="rounded-circle"
                    style={{ width: '30px', height: '30px' }} // Adjust size as needed
                  />
                  
                  
                  
<button className="btn btn-outline-secondary rounded-circle p-2"style={{
                  background:
                    ("url('/src/assets/homeImage.png')"),
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  width: "50px",
                  height: "50px",
                  padding: "0",
                  transition: "box-shadow 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                  // Adding the glow effect when mouse enters
                  e.target.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.7)";
                  }}
                  onMouseLeave={(e) => {
                    // Removing the glow effect when mouse leaves
                    e.target.style.boxShadow = "none";
                  }}>
                </button>*/