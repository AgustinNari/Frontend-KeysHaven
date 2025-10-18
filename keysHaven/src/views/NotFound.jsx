import React from 'react';
import { Link } from 'react-router-dom';
import "../components/estilos/Fondos.css";
import Number404 from '/src/assets/doppyKnight/404.png'
export default function NotFound() {
  if(location.pathname === '/404'){
    return (
      <section
        className="position-relative text-center text-white py-5"
        style={{
          background:
            ("url('/src/assets/doppyKnight/doppyMessageBoard.png'), url('/src/assets/doppyKnight/paisaje.jpg')"),
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
          minHeight: "140vh",
        }}>
          <div style={{ position: "relative", zIndex: 2 }}>
          <h2 className="text-primary">404 - Página no encontrada</h2>
          <p>
            <Link to="/" className="text-primary"  style={{textDecoration: "underline" }}>
              Volver al Home
            </Link>
          </p>
          <div style={{ position: "relative", zIndex: 2 }}>
            <img
              src={Number404}
              alt="Number 404"
              width={450}
              height={270}
              style={{ display: "block", margin: "0 auto", marginTop: "50px" }}
            />
          </div>
        </div>
      </section>
      /*<div className="text-center">
        <h2>404 - Página no encontrada</h2>
        <p><Link to="/">Volver al Home</Link></p>
      </div>*/
    );
  }
}
