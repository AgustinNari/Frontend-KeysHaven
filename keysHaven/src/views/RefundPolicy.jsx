import React from "react";

export default function RefundPolicy() {
  return (
    <div className="container py-5" data-bs-theme="dark">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-lg p-4 bg-dark text-white">
            <h4 className="fw-bold text-primary text-center mb-4">
              Politica de reembolsos
            </h4>
            <p className="text-center text-muted mb-4">
              Aqui se detallan las condiciones bajo las cuales KeysHaven puede
              ofrecer reembolsos o reemplazos de claves.
            </p>

            <div
              className="terms-content"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              <h5 className="text-primary mt-4">1. Alcance de la politica</h5>
              <p className="text-light">
                Esta politica aplica unicamente a las compras realizadas a traves
                de la plataforma de KeysHaven. No cubre compras realizadas por
                fuera del sitio ni cambios de opinion sobre el producto.
              </p>

              <h5 className="text-primary mt-4">
                2. Casos en los que se puede solicitar reembolso
              </h5>
              <p className="text-light">
                Se podra evaluar un reembolso o reemplazo en los siguientes casos:
                <br />
                - La clave recibida es invalida o ya fue utilizada al momento de
                intentar activarla por primera vez. <br />
                - La clave no coincide con el producto indicado en el detalle de
                la compra. <br />
                - Se produjo un error tecnico de la plataforma que impidio la
                entrega correcta de la clave.
              </p>

              <h5 className="text-primary mt-4">
                3. Plazos para realizar reclamos
              </h5>
              <p className="text-light">
                Los reclamos deben realizarse dentro de las primeras 24 horas
                desde la entrega de la clave. Pasado ese plazo, no podremos
                garantizar la investigacion ni el reembolso correspondiente.
              </p>

              <h5 className="text-primary mt-4">
                4. Casos en los que NO aplica reembolso
              </h5>
              <p className="text-light">
                No podremos ofrecer reembolsos en las siguientes situaciones:
                <br />
                - La clave ya fue activada correctamente en la plataforma de
                destino. <br />
                - La clave no puede utilizarse por restricciones regionales o de
                plataforma que estaban aclaradas en la pagina del producto. <br />
                - Errores de cuenta del usuario (por ejemplo, activacion en una
                cuenta equivocada). <br />
                - Uso indebido, compartido o revendido de la clave luego de la
                compra.
              </p>

              <h5 className="text-primary mt-4">
                5. Proceso para solicitar un reembolso
              </h5>
              <p className="text-light">
                Para iniciar un reclamo deberas ponerte en contacto con el
                soporte de KeysHaven y proporcionar: <br />
                - Comprobante de compra. <br />
                - Capturas de pantalla del error al intentar activar la clave.{" "}
                <br />
                - Cualquier informacion adicional que pueda ayudar a verificar el
                problema. <br />
                Cada caso sera evaluado individualmente y se te notificara la
                resolucion.
              </p>

              <h5 className="text-primary mt-4">6. Forma de devolucion</h5>
              <p className="text-light">
                En caso de aprobarse un reembolso, este podra realizarse a traves
                del mismo medio de pago utilizado originalmente o como saldo en
                tu cuenta de KeysHaven, segun corresponda y sujeto a
                disponibilidad de los proveedores de pago.
              </p>

              <div className="alert alert-warning mt-4" role="alert">
                <strong>Importante:</strong> antes de realizar una compra,
                verifica siempre que el juego sea compatible con tu region y
                plataforma. Esto ayuda a evitar inconvenientes y demoras en el
                proceso de soporte.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
