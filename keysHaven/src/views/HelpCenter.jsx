import React from "react";
import DoppyTU from "../assets/doppyKnight/doppyThumbsUp.png";

export default function HelpCenter() {
  return (
    <div className="container py-5" data-bs-theme="dark">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-lg p-4 bg-dark text-white">
            <h4 className="fw-bold text-primary text-center mb-4">
              Centro de ayuda y contacto
            </h4>
            <p className="text-center text-muted mb-4">
              Si tenes algun problema con tu compra o dudas sobre el uso de
              KeysHaven, aca vas a encontrar la informacion necesaria para
              contactarnos y recibir asistencia.
            </p>

            <div
              className="terms-content"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              <h5 className="text-primary mt-4">1. Cuando conviene contactarnos</h5>
              <p className="text-light">
                Te recomendamos escribirnos en estas situaciones:
                <br />
                - Problemas al activar una clave o mensajes de error. <br />
                - La clave recibida no coincide con el producto que compraste.{" "}
                <br />
                - No ves tu pedido acreditado luego de realizar el pago. <br />
                - Dudas sobre metodos de pago, reembolsos o seguridad.
              </p>

              <h5 className="text-primary mt-4">2. Canales de soporte</h5>
              <p className="text-light">
                Actualmente podes comunicarte con nuestro equipo a traves de:
                <br />
                - Email de soporte:{" "}
                <strong className="text-primary-light">contacto@keyshaven.com</strong> <br />
                - Teléfono:{" "}
                <strong className="text-primary-light">+54 11 3306-8080</strong> horarios de llamada de 9 a 16<br />
                - Formulario de contacto dentro de la plataforma (cuando este
                  disponible). <br />
                - Seccion de Preguntas Frecuentes (FAQ) para dudas generales.
              </p>

              <h5 className="text-primary mt-4">
                3. Informacion que agiliza la atencion
              </h5>
              <p className="text-light">
                Para poder ayudarte lo mas rapido posible, intenta incluir:
                <br />
                - ID del pedido y fecha de compra. <br />
                - Plataforma del juego (por ejemplo, Steam, Epic, etc.). <br />
                - Capturas de pantalla del error o mensaje que estas viendo.{" "}
                <br />
                - Cualquier otro dato que consideres relevante.
              </p>

              <h5 className="text-primary mt-4">4. Estados de tu consulta</h5>
              <p className="text-light">
                Una vez que recibimos tu mensaje, seguimos un flujo similar a este:
                <br />
                - <strong>Recibida:</strong> confirmamos que tu consulta llego
                  correctamente. <br />
                - <strong>En revision:</strong> analizamos el caso y, si hace
                  falta, lo revisamos junto al vendedor o con el sistema de
                  claves. <br />
                - <strong>Resuelta:</strong> te informamos la solucion, que puede
                  incluir el envio de una nueva clave o un reembolso segun
                  nuestras politicas.
              </p>

              <div className="alert alert-warning mt-4" role="alert">
                <strong>Tip:</strong> Adjuntar capturas de pantalla del problema
                suele acelerar mucho la resolucion y evita idas y vueltas
                innecesarias.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="col-12 d-flex justify-content-start"
        style={{ position: "relative", height: "40px", zIndex: 2 }}
      >
        <img
          src={DoppyTU}
          alt="Doppy"
          width={450}
          height={600}
          style={{ marginLeft: "-260px", marginTop: "-620px" }}
        />
      </div>

      
    </div>
  );
}
