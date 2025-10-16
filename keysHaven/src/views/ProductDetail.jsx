import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams();
  
  return (

    <div data-bs-theme="dark" className="bg-body text-body">


    <div data-bs-theme="dark" className="bg-body text-body" style={{ width: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Breadcrumb y título */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/catalog">Catálogo</Link></li>
          <li className="breadcrumb-item active">Cyberpunk 2077</li>
        </ol>
      </nav>



      <div className="d-flex gap-4">
        {/* Columna izquierda - Imagen y detalles */}
        <div style={{ width: '800px' }}>
          {/* Imagen principal */}
          <div 
            className="card shadow-sm mb-4"
            style={{ 
              height: '400px',
              background: 'linear-gradient(to top, rgba(25, 16, 34, 0.7) 0%, rgba(25, 16, 34, 0) 40%), url(https://lh3.googleusercontent.com/aida-public/AB6AXuAVWC1WdCxdBzHeZT3DJolmRqzsTLVQnXlXP8lpKMaH7IhkQJ9Ks6HLugU9EVuQfMnZi_op-B0cds6n9cUnVKslipU1ENpFzWarv2WkzsRaz-yiOviXGhYhKnErU0NmuQicpMz1UaDeQ3yz67Zo8bkUL-vgt1z6jm0XPrORBhcueGXAdbKGCGB1NXy6E5ikWU0BryGjlnYLdKP9SVa9Z1sfV-hsXNEWWE5GOSxXF59wDBUlHFs3P8UprVyFhPsYOUcuBaFd7iBKqXM) center/cover'
            }}
          >
            <div className="d-flex justify-content-center gap-2" style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)' }}>
              {[1, 2, 3, 4, 5].map((dot) => (
                <div 
                  key={dot}
                  className={`rounded-circle ${dot === 1 ? 'bg-white' : 'bg-white-50'}`}
                  style={{ width: '8px', height: '8px' }}
                ></div>
              ))}
            </div>
          </div>

          {/* Tabs de contenido */}
          <div className="card shadow-sm">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button className="nav-link link-light">Descripción</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link link-light">Requisitos</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link link-light">Opiniones</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link link-light">Cómo activar</button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              <h5 className="card-title text-primary">Acerca del juego</h5>
              <p className="card-text">
                Cyberpunk 2077 es un RPG de acción y aventura de mundo abierto ambientado en Night City, 
                una megalópolis obsesionada con el poder, el glamour y la modificación corporal. 
                Asumes el papel de V, un mercenario fuera de la ley que busca un implante único que 
                es la clave de la inmortalidad.
              </p>
            </div>
          </div>

          {/* Reseñas */}
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h5 className="card-title text-primary">Opiniones de Clientes</h5>
              
              <div className="d-flex gap-4 mb-4">
                <div className="text-center" style={{ width: '200px' }}>
                  <div className="h2 text-primary mb-2">4.5</div>
                  <div className="text-warning mb-2">
                    {'★'.repeat(4)}<span className="text-muted">★</span>
                  </div>
                  <small className="text-muted">Basado en 125 reseñas</small>
                </div>
                
                <div style={{ width: '400px' }}>
                  {[5, 4, 3, 2, 1].map((stars, index) => (
                    <div key={stars} className="d-flex align-items-center mb-1">
                      <span className="me-2" style={{ width: '20px' }}>{stars}</span>
                      <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-primary" 
                          style={{ width: `${[40, 30, 15, 10, 5][index]}%` }}
                        ></div>
                      </div>
                      <small className="text-muted" style={{ width: '40px' }}>{[40, 30, 15, 10, 5][index]}%</small>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comentarios de reseñas */}
              <div className="border-top pt-3">
                {[
                  {
                    name: "Carlos M.",
                    date: "15 de julio de 2023",
                    stars: 5,
                    comment: "¡Increíble juego! La historia es atrapante y los gráficos son impresionantes. Lo recomiendo totalmente.",
                    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrEJceBSdYCsyijaDKak66KVrHZPRfDkrPoBGY12cfMhm0ENyQAmNXBVLZ0VnBeHHTnaHYHMolizQyknBIbDJiiyfYsXW4EAJISt3RPKRgslF_nUA0td-h_zPJHAhuvQZbXywhZZAdrC2M_gOmhwQAdk-wGTy3XRg_X23V0LcpcdoqdObpcPcKSc-Tcx6wImZk2fFrBL8czdRfY8ZeavZSrmWOje_lO3IIiAmpe17lE7p4HxSTo3RahR2RY10mBBM4-y5zURdTvLg"
                  },
                  {
                    name: "Ana R.",
                    date: "20 de junio de 2023",
                    stars: 4,
                    comment: "Buen juego, pero con algunos bugs. La historia es interesante y el mundo es muy detallado.",
                    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGZnOAGauC2yHRVUiwMxN6H8OuLQF-imUaXDVqxCHXhsfveLaIdK1oQAPRAodfsGl88N1zJkDRZ8iz6oQ1zVJSTFce8HU76tQ51Li0heeX-yhVIFge_frPSoLp9ATdIdoAx2_i31ReLyukIUK-l49UmrLj72BCLuSfHSuN5-gEF-CSLWK0TtD-s_t2StxvRTGABiGIbbS4-lBdn5p10SRMc3AN5dXeMRJyQNPBglQRq0aF3wDwaIWBK_yK2sTZTFBok-gJfGoMsJQ"
                  }
                ].map((review, index) => (
                  <div key={index} className="d-flex gap-3 mb-3 pb-3 border-bottom">
                    <img 
                      src={review.avatar} 
                      alt={`Avatar de ${review.name}`}
                      className="rounded-circle"
                      style={{ width: '50px', height: '50px' }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div>
                          <strong className="text-white">{review.name}</strong> 
                          <br />
                          <small className="text-muted">{review.date}</small>
                        </div>
                        <div className="text-warning text-primary">
                          {'★'.repeat(review.stars)}
                          {'☆'.repeat(5 - review.stars)}
                        </div>
                      </div>
                      <p className="mb-0 text-white">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cómo activar */}
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h5 className="card-title text-primary">¿Cómo activar?</h5>
              <div className="row">
                {[
                  {
                    platform: "Steam",
                    steps: [
                      "Abre la aplicación de Steam.",
                      "Haz clic en 'Agregar un juego' en la esquina inferior izquierda.",
                      "Selecciona 'Activar un producto en Steam' e ingresa tu clave."
                    ]
                  },
                  {
                    platform: "PlayStation",
                    steps: [
                      "En tu consola PlayStation, ve a PlayStation Store.",
                      "Selecciona 'Canjear códigos' en el menú.",
                      "Ingresa tu clave de juego y sigue las instrucciones."
                    ]
                  },
                  {
                    platform: "Xbox",
                    steps: [
                      "En tu consola Xbox, ve a la Tienda.",
                      "Selecciona 'Usar un código' en el menú.",
                      "Ingresa tu clave de juego y sigue las instrucciones."
                    ]
                  }
                ].map((platform, index) => (
                  <div key={index} className="col-4">
                    <div className="card border h-100">
                      <div className="card-body">
                        <h6 className="card-title text-white ">{platform.platform}</h6>
                        <ol className="ps-3">
                          {platform.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="small mb-1 text-muted">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Información de compra */}
        <div style={{ width: '350px' }}>
          <div className="card shadow-sm" style={{ top: '20px' }}>
            <div className="card-body">
              <h4 className="card-title text-primary fw-bold mb-3">Cyberpunk 2077</h4>
              <p className="text-muted small mb-3">Plataforma: PC | Región: Global | Entrega: Digital</p>
              
              <div className="d-flex justify-content-between align-items-baseline mb-2">
                <span className="h3 fw-bold text-primary">$49.99</span>
                <span className="badge bg-primary bg-opacity-25 text-white">20% OFF</span>
              </div>
              
              <p className="text-muted small mb-3">
                Stock: <span className="fw-bold text-white">100+</span>
              </p>

                {/*}
              <div className="mb-3">
                <label className="form-label small text-muted">Seleccionar vendedor</label>
                <select className="form-select">
                  <option>Vendedor A</option>
                  <option>Vendedor B</option>
                  <option>Vendedor C</option>
                </select>
              </div> */}

              <div className="d-grid gap-2 mb-3">
                <button className="btn btn-primary btn-lg py-2 fw-bold">
                  Comprar ahora
                </button>
                <button className="btn btn-outline-primary btn-lg py-2 fw-bold">
                  Agregar al carrito
                </button>
              </div>

            </div>
          </div>

          {/* Juegos relacionados */}
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h6 className="card-title text-primary fw-bold mb-3">Juegos Relacionados</h6>
              <div className="d-flex flex-column text-white gap-3">
                {[
                  {
                    name: "The Witcher 3: Wild Hunt",
                    price: "$39.99",
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPG4LUZNWeNbjjJv5djRd34QvmgNCKwroYJylwKQlrXGpnAsV62QMp0zqIOCO-0cj9p7x7AGu-Jzb7840ODwlcUQnc16oYtIT-5Qdxnn6Lb5VG0jqDIzx1dyflVDQsJVIbaTEE-h6t-CpI7yevCXp_PwxL2ZDA9tq5Kh85VXz9bYe8sjW3jXsMDBLQ-BeIXFZfLSTJwJUxVHkdycnJBWWyMtiooG1_rUXw5ITu2IcJixcUH39bO7_BDIvrFGxUa9tHIkndmsoPfV4"
                  },
                  {
                    name: "Red Dead Redemption 2",
                    price: "$59.99",
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxGaNJGvUlCsvQp0tAI9anPZqB3znu36tv4sP861tHukaBUBNhfYC_W4gtLBGq-nfHD5UnkJI77nk2AOznNF-0qlr3EsP6qvZpnmJVEqG19Cl0aigy0sZ832rf7WInRxXPVudHMHO4iEbPBtLH_utyYP2hocdFAwlEUZJ3HboFjQ5smpdRlJwKhqGy8nq6lrUa6-SHg_SfXYA_iuAchIyxusXUYFjjkoBXxWBJBbR3T8rZlqdFjyHwKWHsXZIraD1f08tewIX7mh0"
                  }
                ].map((game, index) => (
                  <div key={index} className="d-flex gap-2">
                    <img 
                      src={game.image} 
                      alt={game.name}
                      style={{ width: '60px', height: '80px', objectFit: 'cover' }}
                      className="rounded"
                    />
                    <div>
                      <h6 className="text-white small mb-1">{game.name}</h6>
                      <p className="text-primary fw-bold mb-0 small">{game.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}