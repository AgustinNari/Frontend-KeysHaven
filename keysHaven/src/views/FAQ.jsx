import React from "react";

import DoppyProf from "../assets/doppyKnight/doppyProfessor.png"

export default function FAQ() {

  return (
    <div className="container py-5" data-bs-theme="dark">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-lg p-4 bg-dark text-white">
            <h4 className="fw-bold text-primary text-center mb-4">Preguntas Frecuentes (FAQ)</h4>
            <p className="text-center text-muted mb-4">
              Encuentra respuestas a las preguntas más comunes sobre nuestra plataforma.
            </p>

            <div className="terms-content" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <h5 className="text-primary mt-4">1. ¿Qué son las claves de videojuegos?</h5>
              <p className="text-light">
                Las claves de videojuegos son códigos alfanuméricos que te permiten descargar y activar 
                juegos digitales en plataformas como Steam, Epic Games, PlayStation Store, Xbox Live o Nintendo eShop. 
                Funcionan como una licencia digital para acceder al juego completo.
              </p>

              <h5 className="text-primary mt-4">2. ¿Cómo compro una clave en su plataforma?</h5>
              <p className="text-light">
                Para comprar una clave: <br/>
                - Navega por nuestro catálogo y selecciona el juego que deseas <br/>
                - Añádelo a tu carrito y procede al pago <br/>
                - Una vez confirmado el pago, recibirás la clave instantáneamente en tu cuenta <br/>
                - Copia la clave y actívala en la plataforma correspondiente
              </p>

              <h5 className="text-primary mt-4">3. ¿Cómo puedo vender mis claves?</h5>
              <p className="text-light">
                Para vender claves en nuestra plataforma: <br/>
                - Crea una cuenta de vendedor verificada <br/>
                - Proporciona información precisa sobre las claves que ofreces <br/>
                - Establece tu precio competitivo <br/>
                - Una vez vendida, recibirás el pago menos nuestra comisión
              </p>

              <h5 className="text-primary mt-4">4. ¿Las claves tienen garantía?</h5>
              <p className="text-light">
                Sí, todas las claves vendidas en nuestra plataforma están garantizadas. Si recibes una clave 
                que no funciona o ha sido ya utilizada, ofrecemos reembolso completo o reemplazo dentro de 
                las primeras 24 horas tras la compra. Una vez activada la clave, la garantía no aplica.
              </p>

              <h5 className="text-primary mt-4">5. ¿Qué métodos de pago aceptan?</h5>
              <p className="text-light">
                Aceptamos diversos métodos de pago seguros: tarjetas de crédito y débito (Visa, MasterCard, American Express), 
                PayPal, Mercado Pago, y transferencias bancarias en algunos países. Todos los pagos se procesan 
                a través de pasarelas de pago seguras y cifradas.
              </p>

              <h5 className="text-primary mt-4">6. ¿Puedo reembolsar un juego después de activar la clave?</h5>
              <p className="text-light">
                No, una vez que la clave ha sido revelada y activada en cualquier plataforma, no podemos 
                ofrecer reembolsos. Esto se debe a que la clave queda vinculada permanentemente a tu cuenta. 
                Antes de activar, asegúrate de que es el juego correcto y compatible con tu región.
              </p>

              <h5 className="text-primary mt-4">7. ¿Las claves son regionales?</h5>
              <p className="text-light">
                Algunas claves pueden tener restricciones regionales. En la página de cada producto 
                indicamos claramente las regiones compatibles. Es tu responsabilidad verificar que la clave 
                es compatible con tu región antes de realizar la compra. No nos hacemos responsables por 
                claves adquiridas para regiones incorrectas.
              </p>

              <h5 className="text-primary mt-4">8. ¿Qué hago si mi clave no funciona?</h5>
              <p className="text-light">
                Si recibes una clave que no funciona: <br/>
                - Verifica que la estás ingresando correctamente (sin espacios adicionales) <br/>
                - Confirma que es compatible con tu región y plataforma <br/>
                - Si persiste el problema, contacta a nuestro soporte dentro de las 24 horas <br/>
                - Proporciona el comprobante de compra y detalles del error
              </p>

              <h5 className="text-primary mt-4">9. ¿Cuánto tiempo tarda en llegar mi clave después del pago?</h5>
              <p className="text-light">
                En la mayoría de los casos, las claves se entregan instantáneamente tras confirmarse el pago. 
                En raras ocasiones, puede haber demoras de hasta 15 minutos debido a verificaciones de seguridad. 
                Si no recibes tu clave después de 30 minutos, contacta a nuestro servicio de soporte.
              </p>

              <h5 className="text-primary mt-4">10. ¿Necesito crear una cuenta para comprar?</h5>
              <p className="text-light">
                Sí, para añadir artículos al carrito y completar una compra, es necesario crear una cuenta. Adicionalmente, esto te permitirá: <br/>
                - Acceder a tu historial de compras <br/>
                - Dejar reseñas sobre los productos que compres <br/>
                - Recibir ofertas exclusivas y descuentos <br/>
                - Gestionar reclamaciones
              </p>

              <div className="alert alert-warning mt-4" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Importante:</strong> Si tienes alguna pregunta adicional, no dudes en contactar 
                a nuestro equipo de soporte a través del formulario de contacto o correo electrónico. 
                Estamos disponibles 24/7 para ayudarte.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-4 text-center" style={{position: "relative", zIndex: 2}}>
              <img
                src=  {DoppyProf}
                alt= "Doppy"
                width={550}
                height={700}
                style={{ display: "block", margin: "0 auto", marginTop: "-90px" }}
              />
      </div>
    </div>
  );
}