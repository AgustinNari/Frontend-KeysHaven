import React from "react";

export default function Privacy() {
  return (
    <div className="container py-5" data-bs-theme="dark">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-lg p-4 bg-dark text-white">
            <h4 className="fw-bold text-primary text-center mb-4">
              Políticas de Privacidad
            </h4>
            <p className="text-center text-muted mb-4">
              Aquí encontrarás información sobre cómo tratamos tus datos dentro de la plataforma.
            </p>

            <div
              className="terms-content"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              <h5 className="text-primary mt-4">1. Datos que podemos recopilar</h5>
              <p className="text-light">
                Podemos recopilar información básica de tu cuenta como nombre, correo
                electrónico, país, rol (comprador o vendedor), así como información
                relacionada con tus compras, ventas y reseñas realizadas en KeysHaven.
              </p>

              <h5 className="text-primary mt-4">2. Uso de la información</h5>
              <p className="text-light">
                Utilizamos tus datos para poder gestionar tu cuenta, procesar pedidos,
                mejorar la experiencia de uso, mantener la seguridad de la plataforma y
                cumplir con obligaciones legales cuando corresponda.
              </p>

              <h5 className="text-primary mt-4">3. Conservación y protección</h5>
              <p className="text-light">
                Conservamos tu información únicamente durante el tiempo necesario para
                las finalidades anteriores. Tomamos medidas razonables para proteger tus
                datos frente a accesos no autorizados o uso indebido.
              </p>

              <h5 className="text-primary mt-4">4. Tus derechos</h5>
              <p className="text-light">
                Podés solicitar la actualización o corrección de tus datos de cuenta
                y, en ciertos casos, la eliminación de los mismos. Ante cualquier duda
                relacionada con la privacidad, podés contactarnos a través de los
                canales de soporte disponibles en la plataforma.
              </p>

              <div className="alert alert-warning mt-4" role="alert">
                <strong>Nota:</strong> Este texto puede ajustarse o ampliarse en caso de
                que la cátedra requiera políticas más formales o específicas.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
