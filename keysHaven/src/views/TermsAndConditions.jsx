import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { selectIsAuthenticated } from "../redux/slices/authSlice";

export default function TermsAndConditions() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (isAuthenticated) {
      navigate(-1);
      return;
    }

    if (accepted) {
      if (location.state?.from === 'register') {
        navigate("/register", {
          state: { termsAccepted: true }
        });
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div className="container py-5" data-bs-theme="dark">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-lg p-4 bg-dark text-white">
            <h4 className="fw-bold text-primary text-center mb-4">Términos y Condiciones</h4>
            <p className="text-center text-muted mb-4">
              Por favor, lee atentamente nuestros Términos y Condiciones y nuestra Política de Privacidad antes de utilizar la plataforma.
             </p>

            <div className="terms-content" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <h5 className="text-primary mt-4">1. Aceptación de los Términos</h5>
              <p className="text-light">
                Al acceder y utilizar nuestros servicios de compra y venta de claves de videojuegos, 
                aceptas cumplir y estar sujeto a estos términos y condiciones. Si no estás de acuerdo 
                con alguna parte de estos términos, no podrás utilizar nuestros servicios.
              </p>

              <h5 className="text-primary mt-4">2. Descripción del Servicio</h5>
              <p className="text-light">
                Nuestra plataforma facilita la compra y venta de claves de videojuegos digitales 
                para diversas plataformas (PC, PlayStation, Xbox, Nintendo Switch, etc.). 
                Actuamos como intermediarios entre compradores y vendedores, sin ser propietarios 
                de las claves comercializadas.
              </p>

              <h5 className="text-primary mt-4">3. Registro y Cuenta</h5>
              <p className="text-light">
                Para realizar compras o ventas en nuestra plataforma, deberás crear una cuenta 
                proporcionando información veraz y actualizada. Eres responsable de mantener 
                la confidencialidad de tu cuenta y contraseña, y de todas las actividades 
                que ocurran bajo tu cuenta.
              </p>

              <h5 className="text-primary mt-4">4. Proceso de Compra</h5>
              <p className="text-light">
                - Al realizar una compra, aceptas pagar el precio indicado por la clave.<br/>
                - Una vez confirmado el pago, recibirás la clave en tu cuenta o por correo electrónico.<br/>
                - Las claves son generadas digitalmente y deben activarse en la plataforma correspondiente.<br/>
                - No aceptamos devoluciones una vez que la clave ha sido revelada.
              </p>

              <h5 className="text-primary mt-4">5. Proceso de Venta</h5>
              <p className="text-light">
                - Como vendedor, garantizas que posees derechos legítimos sobre las claves que vendes.<br/>
                - Las claves deben ser válidas y funcionar correctamente.<br/>
                - Nos reservamos el derecho de retener pagos en caso de disputas o claves inválidas.<br/>
                - Los vendedores reciben el pago menos nuestra comisión por transacción.
              </p>

              <h5 className="text-primary mt-4">6. Precios y Pagos</h5>
              <p className="text-light">
                Todos los precios se muestran en la moneda local e incluyen los impuestos aplicables. 
                Aceptamos diversos métodos de pago, incluyendo tarjetas de crédito/débito, PayPal 
                y Mercado Pago. Los pagos se procesan de forma segura a través de nuestros socios 
                de pago certificados.
              </p>

              <h5 className="text-primary mt-4">7. Propiedad Intelectual</h5>
              <p className="text-light">
                Las claves de videojuegos están sujetas a derechos de autor y propiedad intelectual 
                de los respectivos desarrolladores y editores. Al comprar una clave, adquieres 
                una licencia de uso personal no transferible para el producto digital.
              </p>

              <h5 className="text-primary mt-4">8. Limitación de Responsabilidad</h5>
              <p className="text-light">
                No nos hacemos responsables por:<br/>
                - Problemas de activación de claves debido a regiones o restricciones regionales.<br/>
                - Cambios en los términos de servicio de las plataformas de videojuegos.<br/>
                - Disponibilidad de servidores o mantenimiento de las plataformas.<br/>
                - Uso indebido de las claves por parte de los compradores.
              </p>

              <h5 className="text-primary mt-4">9. Modificaciones de los Términos</h5>
              <p className="text-light">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación 
                en la plataforma. El uso continuado de nuestros servicios constituye la aceptación 
                de los términos modificados.
              </p>

              <h5 className="text-primary mt-4">10. Ley Aplicable</h5>
              <p className="text-light">
                Estos términos se rigen por las leyes del país donde opera nuestra empresa. 
                Cualquier disputa será resuelta en los tribunales competentes de dicha jurisdicción.
              </p>

              <div className="alert alert-warning mt-4" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Importante:</strong> Al comprar claves, asegúrate de que sean compatibles 
                con tu región y plataforma. No nos hacemos responsables por claves adquiridas 
                para regiones incorrectas.
              </div>
            </div>

            {isAuthenticated ? (
              <div className="d-grid gap-2 mt-4">
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Volver</button>
              </div>
            ) : (
              <>
                <div className="form-check mt-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="acceptTerms"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                  />
                  <label className="form-check-label text-light" htmlFor="acceptTerms">
                    He leído y acepto los términos y condiciones
                  </label>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button
                    className="btn btn-primary py-2 fw-bold"
                    disabled={!accepted}
                    onClick={handleAccept}
                  >
                    Aceptar y Continuar
                  </button>

                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}