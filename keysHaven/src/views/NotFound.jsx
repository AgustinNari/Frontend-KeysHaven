import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import "../components/estilos/Fondos.css";

import { getLastApiError } from '../services/errorService';

import DoppyBoard from '/src/assets/doppyKnight/doppyMessageBoard.png';
import DoppyUnplugged from '/src/assets/doppyKnight/doppyUnplugged.png';
import Number400 from '/src/assets/doppyKnight/400.png';
import Number401 from '/src/assets/doppyKnight/401.png';
import Number403 from '/src/assets/doppyKnight/403.png';
import Number404 from '/src/assets/doppyKnight/404.png';
import Number409 from '/src/assets/doppyKnight/409.png';
import Number500 from '/src/assets/doppyKnight/500.png';

export default function NotFound() {

  const location = useLocation();

  let imageTop = DoppyBoard;
  let imageBottom = Number404;
  let messageText = "404 - Página no encontrada";

  const [error, setError] = useState(getLastApiError());

  if (error?.status === 400) {
    imageBottom = Number400;
    messageText = "400 - BAD_REQUEST";
  } else if (error?.status === 401) {
    imageBottom = Number401;
    messageText = "401 - Acceso No Autorizado";
  } else if (error?.status === 403) {
    imageBottom = Number403;
    messageText = "403 - Prohibido el Acceso!!!";
  } else if (error?.status === 404) {
    imageBottom = Number404;
    messageText = "404 - Página no encontrada";
  } else if (error?.status === 409) {
    imageBottom = Number409;
    messageText = "409 - Conflicto";
  } else if (error?.status === 500) {
    imageBottom = Number500;
    messageText = "500 - Error Interno del Servidor";
  } else {
    imageTop = DoppyUnplugged;
    imageBottom = null;
    messageText = "Error Desconocido";
  }
 
  useEffect(() => {
    if (error && error.message) {
      setError(error);
      setErrorMessage(error.message);
    }
  }, []);


    return (
      <section
        className="position-relative text-center text-white py-5"
        style={{
          background:
            ("url('/src/assets/doppyKnight/paisaje.jpg')"),
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "850px",
        }}>
         <div style={{ position: "relative", zIndex: 2}}>
          <div style={{ position: "relative", zIndex: 2000}}>
            <h2 className="text-primary">{messageText}</h2>
            <h3 className="text-primary">{error?.message || "Error Grave......GRAVÍSIMO!!!!!!!"}</h3>
            <p>
              <Link to="/home" className="text-primary"  style={{textDecoration: "hover-underline"}}>
                Volver al Home
              </Link>
            </p>
           </div>
           <div style={{position: "relative", zIndex: 2}}>
             <img
               src=  {imageTop}
               alt= "Doppy"
               width={550}
               height={700}
               style={{ display: "block", margin: "0 auto", marginTop: "-90px" }}
             />
             <div style={{ position: "relative", zIndex: 3 }}>
              {imageBottom &&(
               <img
                 src={imageBottom}
                 alt={imageBottom ? "NumberError" : null}
                 width={350}
                 height={170}
                 style={{ display: "block", margin: "0 auto", marginTop: "-805px"}}
               />)}
             </div>
           </div>
         </div>
     </section>
   );
}
