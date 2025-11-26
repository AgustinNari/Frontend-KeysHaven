import React from "react";

import DoppyHU from "../assets/doppyKnight/doppyHandsUp.png";

export default function ContactUs() {
  return (
    <div className="container py-5" data-bs-theme="dark">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-lg p-4 bg-dark text-white">
            <h4 className="fw-bold text-primary text-center mb-4">
                Contacto
            </h4>
            <p className="text-center text-muted mb-4">
                Teléfono: +54 11 3306-8080
            </p>
            <p className="text-center text-muted mb-4">
                Email: contacto@keyshaven.com
            </p>
            <p className="text-center text-muted mb-4">
                Dirección: Av.Tecnología 443, CABA, Argentina
            </p>
          </div>
        </div>
      </div>
      <div
        className="col-10 d-flex justify-content-center"
        style={{ position: "relative", zIndex: 2 }}
      >
        <img
          src={DoppyHU}
          alt="Doppy"
          width={550}
          height={700}
          style={{ marginRight: "-280px", marginTop: "-100px" }}
        />
      </div>
    </div>
  );
}
