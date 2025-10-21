import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import "../components/estilos/Fondos.css";
import DoppyBoard from '/src/assets/doppyKnight/doppyMessageBoard.png';
import Number404 from '/src/assets/doppyKnight/404.png';
import Number400 from '/src/assets/doppyKnight/400.png';
import Number401 from '/src/assets/doppyKnight/401.png';
import Number403 from '/src/assets/doppyKnight/403.png';
import Number409 from '/src/assets/doppyKnight/409.png';
import Number500 from '/src/assets/doppyKnight/500.png';

export default function NotFound() {
  let imageTop = DoppyBoard;
  let imageBottom = Number404;
  
  if (location.pathname === '/400') {
    imageBottom = Number400;
  } else if (location.pathname === '/401') {
    imageBottom = Number401;
  } else if (location.pathname === '/403') {
    imageBottom = Number403;
  } else if (location.pathname === '/409') {
    imageBottom = Number409;
  } else if (location.pathname === '/500') {
    imageBottom = Number500;
  }
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
         <div style={{ position: "relative", zIndex: 2 }}>
           <h2 className="text-primary">404 - Página no encontrada</h2>
           <p>
             <Link to="/" className="text-primary"  style={{textDecoration: "underline" }}>
               Volver al Home
             </Link>
           </p>
           <div style={{position: "relative", zIndex: 2}}>
             <img
               src=  {imageTop}
               alt= "Doppy"
               width={550}
               height={700}
               style={{ display: "block", margin: "0 auto", marginTop: "-90px" }}
             />
             <div style={{ position: "relative", zIndex: 3 }}>
               <img
                 src={imageBottom}
                 alt="NumberError"
                 width={350}
                 height={170}
                 style={{ display: "block", margin: "0 auto", marginTop: "-805px"}}
               />
             </div>
           </div>
         </div>
     </section>
   );
}
/*<div className="text-center">
        <h2>404 - Página no encontrada</h2>
        <p><Link to="/">Volver al Home</Link></p>
      </div>*///url('/src/assets/doppyKnight/doppyMessageBoard.png')
