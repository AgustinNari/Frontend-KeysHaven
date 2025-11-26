import React from "react";
import DoppyProf from "../assets/doppyKnight/doppyProfessor.png";

export default function About() {
  return (
    <div className="container py-5" data-bs-theme="dark">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-lg p-4 bg-dark text-white">
            <h4 className="fw-bold text-primary text-center mb-4">
              Sobre KeysHaven
            </h4>
            <p className="text-center text-muted mb-4">
              KeysHaven es una plataforma digital pensada para que puedas
              comprar y vender claves de videojuegos de forma segura, rapida
              y sencilla.
            </p>

            <div
              className="terms-content"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              <h5 className="text-primary mt-4">Nuestra mision</h5>
              <p className="text-light">
                Queremos que los jugadores puedan acceder a sus juegos favoritos
                al mejor precio posible, sin complicaciones y con total
                transparencia. Para eso conectamos a compradores y vendedores
                de claves digitales en un mismo lugar, con herramientas de
                seguridad y control pensadas para ambos.
              </p>

              <h5 className="text-primary mt-4">Como funciona KeysHaven</h5>
              <p className="text-light">
                El funcionamiento es simple:
                <br />
                - Exploras nuestro catalogo de juegos y filtras por plataforma
                o genero. <br />
                - Elegis el juego que queres y completas el pago con alguno
                de los metodos disponibles. <br />
                - Recibis tu clave digital y la activas en la plataforma
                correspondiente (por ejemplo, Steam o Epic Games). <br />
                - Si surge algun inconveniente, nuestro equipo de soporte te
                acompaña para resolverlo.
              </p>

              <h5 className="text-primary mt-4">Confianza para compradores y vendedores</h5>
              <p className="text-light">
                Los compradores cuentan con informacion clara sobre el producto,
                la region y la plataforma de cada clave. Los vendedores, por su
                parte, disponen de un espacio para gestionar su stock, revisar
                sus ventas y recibir valoraciones de los usuarios.
              </p>

              <h5 className="text-primary mt-4">Nuestro enfoque</h5>
              <p className="text-light">
                Diseñamos KeysHaven con foco en la experiencia del jugador:
                <br />
                - Interfaz limpia y orientada a la busqueda de juegos. <br />
                - Reseñas y calificaciones para ayudarte a decidir. <br />
                - Secciones de ayuda, politicas claras y comunicacion directa
                  ante cualquier duda.
              </p>

              <h5 className="text-primary mt-4">Mirando hacia adelante</h5>
              <p className="text-light">
                Seguimos trabajando para sumar nuevas funciones, plataformas y
                beneficios para nuestra comunidad. Ya sea que compres un juego
                de vez en cuando o seas un coleccionista digital, la idea es que
                siempre encuentres en KeysHaven un lugar confiable para hacerlo.
              </p>
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
}
