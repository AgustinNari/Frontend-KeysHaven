import React from "react";
import DoppyTU from "../assets/doppyKnight/doppyThumbsUp.png";

export default function Privacy() {
  return (
    <div className="container py-5" data-bs-theme="dark">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-lg p-4 bg-dark text-white">
            <h4 className="fw-bold text-primary text-center mb-4">
              Politicas de Privacidad
            </h4>
            <p className="text-center text-muted mb-4">
              Aqui encontraras informacion sobre como tratamos tus datos dentro
              de la plataforma.
            </p>

            <div
              className="terms-content"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              <h5 className="text-primary mt-4">1. Datos que podemos recopilar</h5>
              <p className="text-light">
                Podemos recopilar informacion basica de tu cuenta como nombre,
                correo electronico, pais y rol (comprador o vendedor), asi como
                informacion relacionada con tus compras, ventas y reseñas
                realizadas en KeysHaven.
              </p>

              <h5 className="text-primary mt-4">2. Uso de la informacion</h5>
              <p className="text-light">
                Utilizamos tus datos para gestionar tu cuenta, procesar pedidos,
                mejorar la experiencia de uso, mantener la seguridad de la
                plataforma, prevenir fraudes y cumplir con obligaciones legales
                cuando corresponda.
              </p>

              <h5 className="text-primary mt-4">3. Conservacion y proteccion</h5>
              <p className="text-light">
                Conservamos tu informacion unicamente durante el tiempo
                necesario para las finalidades anteriores. Implementamos
                medidas razonables de seguridad para proteger tus datos frente
                a accesos no autorizados, perdidas o uso indebido.
              </p>

              <h5 className="text-primary mt-4">4. Compartir informacion con terceros</h5>
              <p className="text-light">
                Podemos compartir determinados datos con proveedores de
                servicios que nos ayudan a operar la plataforma (por ejemplo,
                procesadores de pago o servicios de infraestructura). En todos
                los casos exigimos que traten la informacion de forma segura y
                solo para los fines autorizados. No vendemos tus datos
                personales a terceros.
              </p>

              <h5 className="text-primary mt-4">5. Tus derechos</h5>
              <p className="text-light">
                Podes solicitar la actualizacion o correccion de tus datos de
                cuenta y, en ciertos casos, la eliminacion de los mismos, siempre
                que no exista una obligacion legal de conservarlos. Si tenes
                dudas sobre como tratamos tu informacion, podes contactarnos a
                traves de nuestros canales de soporte.
              </p>

              <h5 className="text-primary mt-4">6. Cambios en estas politicas</h5>
              <p className="text-light">
                Podemos actualizar estas politicas de privacidad para reflejar
                cambios en la plataforma o en la normativa aplicable. Cuando
                esto suceda, publicaremos la version actualizada en este mismo
                apartado e indicaremos la fecha de ultima modificacion.
              </p>

              <div className="alert alert-warning mt-4" role="alert">
                <strong>Importante:</strong> Te recomendamos revisar periodicamente
                esta seccion para mantenerte al tanto de como protegemos tu
                informacion.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="col-12 d-flex justify-content-end"
        style={{ position: "relative", height: "40px", zIndex: 2 }}
      >
        <img
          src={DoppyTU}
          alt="Doppy"
          width={500}
          height={650}
          style={{ marginRight: "-280px", marginTop: "-700px" }}
        />
      </div>
    </div>
  );
}
