import bundledAsset0 from "../../assets/keyLogo.svg";
import React from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import "../estilos/Fondos.css";
import { useCart } from "../../store/cart.jsx";
import DoppyThumbsUp from "../../assets/doppyKnight/doppyThumbsUp.png";

import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { selectUser, selectIsAuthenticated, logout } from "../../redux/slices/authSlice";

export default function Navigation() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === "/" || pathname === "/home";

  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const { items } = useCart();
  const cartCount = items.reduce((acc, it) => acc + (it.qty ?? 0), 0);

  const briefName = user?.displayName ?? user?.email ?? "";
  const avatar = user?.avatarDataUrl ?? DoppyThumbsUp;

  const showCartInNavbar = !user || user?.role !== "ADMIN";

  const handleLogout = async () => {
    try {
      await dispatch(logout());
    } catch (e) {
      console.warn("Logout failed:", e);
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg ${isHome ? "home-navbar" : "sticky-top"} navbar-dark bg-primary-dark border-bottom border-light`}>
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src={bundledAsset0} width={55} height={35} alt="KeysHaven" />
          KeysHaven
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Abrir o cerrar navegación"
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
                <li className="nav-item"><NavLink to="/login" className="nav-link">Iniciar sesión</NavLink></li>
                <li className="nav-item"><NavLink to="/register" className="nav-link">Registro</NavLink></li>
              </>
            )}
          </ul>

          <div className="d-flex gap-2 align-items-center">
            {showCartInNavbar && (
              <NavLink to="/cart" className="nav-link" aria-label="Carrito">
                <button className="btn btn-outline-primary rounded-circle p-2 position-relative" title="Carrito" style={{ width: "50px", height: "50px" }}>
                  <span className="material-symbols-outlined">shopping_cart</span>
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cartCount}
                    </span>
                  )}
                </button>
              </NavLink>
            )}

            {isAuthenticated && user?.role === "SELLER" && (
              <NavLink to="/sellerdashboard" className="nav-link" aria-label="Panel de vendedor" title="Panel de vendedor">
                <button className="btn btn-outline-success rounded-circle p-2" style={{ borderColor: "rgba(90, 200, 150, 0.12)" }}>
                  <span className="material-symbols-outlined">storefront</span>
                </button>
              </NavLink>
            )}

            {isAuthenticated && user?.role === "ADMIN" && (
              <NavLink to="/adminpanel" className="nav-link" aria-label="Panel de administración" title="Panel de administración">
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
                      width: "50px",
                      height: "50px",
                      padding: "0",
                      position: "relative",
                      overflow: "hidden",
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    <span className="button-overlay"></span>
                  </button>
                </NavLink>

                <div style={{ color: "#7f13ec", fontWeight: 600 }}>
                  {briefName}
                </div>
                <button
                  className="btn btn-outline-danger rounded-circle p-2"
                  onClick={handleLogout}
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
                    width: "50px",
                    height: "50px",
                    padding: "0",
                    position: "relative",
                    overflow: "hidden",
                    transition: "background-color 0.3s ease",
                  }}
                >
                  <span className="button-overlay"></span>
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
                    `url(${bundledAsset1})`,
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
