import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../store/cart.jsx';
import { PRODUCTS} from '../data/products.js';
import { MOCK_REVIEWS } from '../data/mockReviews.js';
import "../components/estilos/Fondos.css";

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const [activeTab, setActiveTab] = useState('descripcion');
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [theme, setTheme] = useState("bg-primary-dark");

  useEffect(() => {
    // Buscar producto por ID
    const foundProduct = PRODUCTS.find(p => p.id === parseInt(id));
    setProduct(foundProduct);

    // Buscar reviews del producto
    const productReviews = MOCK_REVIEWS.filter(r => r.productId === parseInt(id));
    setReviews(productReviews);

    // Buscar otros productos del mismo vendedor
    if (foundProduct) {
      const sellerProds = PRODUCTS.filter(p => 
        p.sellerId === foundProduct.sellerId && p.id !== foundProduct.id
      ).slice(0, 3);
      setSellerProducts(sellerProds);
    }
  }, [id]);

  if (!product) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div data-bs-theme="dark" className="bg-primary-dark d-flex justify-content-center align-items-center text-body">
      <div data-bs-theme="dark" className="bg-primary-dark text-body" style={{ padding: '40px', minHeight: '100vh' }}>
        {/* Breadcrumb y título */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/catalog">Catálogo</Link></li>
            <li className="breadcrumb-item active">{product.title}</li>
          </ol>
        </nav>

        <div className="d-flex gap-4" style={{ alignItems: 'flex-start' }}>
          {/* Columna izquierda - Imagen y detalles */}
          <div style={{ flex: '1', maxWidth: '800px' }}>
            {/* Imagen principal */}
            <div
              className="card shadow-sm mb-4"
              style={{
                height: '400px',
                background: `linear-gradient(to top, rgba(25, 16, 34, 0.7) 0%, rgba(25, 16, 34, 0) 40%), url(${product.primaryImageUrl}) center/cover`
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
                    <button
                      className={`nav-link ${activeTab === 'descripcion' ? 'active text-primary fw-bold' : 'link-light'}`}
                      onClick={() => setActiveTab('descripcion')}
                    >
                      Descripción
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'requisitos' ? 'active text-primary fw-bold' : 'link-light'}`}
                      onClick={() => setActiveTab('requisitos')}
                    >
                      Requisitos
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'vendedor' ? 'active text-primary fw-bold' : 'link-light'}`}
                      onClick={() => setActiveTab('vendedor')}
                    >
                      Más de este vendedor
                    </button>
                  </li>
                </ul>
              </div>
              <div className="card-body">
                {/* Contenido condicional basado en la pestaña activa */}
                {activeTab === 'descripcion' && (
                  <>
                    <h5 className="card-title text-primary">Acerca del juego</h5>
                    <p className="card-text">
                      {product.title} es un videojuego desarrollado por {product.developer} y publicado por {product.publisher}. 
                      {product.metacriticScore && ` Ha recibido una puntuación de ${product.metacriticScore} en Metacritic.`}
                    </p>
                    <p className="card-text">
                      Fue lanzado el {new Date(product.releaseDate).toLocaleDateString('es-ES')} para la plataforma {product.platform}.
                      {product.categories && ` Pertenece a los géneros: ${product.categories.join(', ')}.`}
                    </p>
                    {product.description && (
                      <p className="card-text">{product.description}</p>
                    )}
                  </>
                )}

                {activeTab === 'requisitos' && (
                  <div>
                    <h5 className="card-title text-primary">Requisitos del Sistema</h5>
                    <div className="row">
                      <div className="col-6">
                        <h6 className="text-white">Mínimos</h6>
                        <ul className="text-muted">
                          <li>SO: Windows 7/8/10 (64-bit)</li>
                          <li>Procesador: Intel Core i5-3570K</li>
                          <li>Memoria: 8 GB RAM</li>
                          <li>Gráficos: GTX 780 3GB</li>
                          <li>Almacenamiento: 70 GB</li>
                          <li>DirectX: Versión 12</li>
                        </ul>
                      </div>
                      <div className="col-6">
                        <h6 className="text-white">Recomendados</h6>
                        <ul className="text-muted">
                          <li>SO: Windows 10 (64-bit)</li>
                          <li>Procesador: Intel Core i7-4790</li>
                          <li>Memoria: 12 GB RAM</li>
                          <li>Gráficos: GTX 1060 6GB</li>
                          <li>Almacenamiento: 70 GB SSD</li>
                          <li>DirectX: Versión 12</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'vendedor' && (
                  <div>
                    <h5 className="card-title text-primary">Más juegos de {product.sellerDisplayName}</h5>
                    <p className="text-muted mb-4">Descubre otros títulos disponibles del mismo vendedor</p>
                    
                    <div className="row">
                      {sellerProducts.map((game, index) => (
                        <div key={index} className="col-4 mb-3">
                          <div className="card border-0 bg-dark h-100">
                            <img
                              src={game.primaryImageUrl}
                              alt={game.title}
                              className="card-img-top"
                              style={{ height: '150px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150x150/191229/ffffff?text=Imagen+No+Disponible';
                              }}
                            />
                            <div className="card-body">
                              <h6 className="card-title text-white small">{game.title}</h6>
                              <div className="d-flex align-items-center mb-2">
                                <span className="text-warning small me-1">★</span>
                                <span className="text-white small">{game.avgRating || 'N/A'}</span>
                              </div>
                              <div className="d-flex align-items-baseline">
                                <span className="text-primary fw-bold me-2">${game.price}</span>
                                {game.originalPrice && (
                                  <span className="text-muted text-decoration-line-through small">${game.originalPrice}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sección de Opiniones (comentada) */}
            {/* 
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
            */}

            {/* Comentarios de reseñas */}
            <div className="card shadow-sm mt-4">
              <div className="card-body">
                <h5 className="card-title text-primary">Opiniones de Clientes</h5>
                <div className="border-top pt-3">
                  {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                      <div key={index} className="d-flex gap-3 mb-3 pb-3 border-bottom">
                        <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                             style={{ width: '50px', height: '50px' }}>
                          <span className="text-white">{review.buyerId}</span>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <div>
                              <strong className="text-white">Usuario {review.buyerId}</strong>
                              <br />
                              <small className="text-muted">
                                {new Date(review.createdAt).toLocaleDateString('es-ES')}
                              </small>
                            </div>
                            <div className="text-warning text-primary">
                              {'★'.repeat(review.rating/2)}
                              {'☆'.repeat(5 - review.rating/2)}
                            </div>
                          </div>
                          <p className="mb-0 text-white">{review.comment}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">Aún no hay reseñas para este producto.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección Cómo activar */}
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
          <div style={{ width: '350px', position: 'sticky', top: '20px' }}>
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title text-primary fw-bold mb-3">{product.title}</h4>
                <p className="text-muted small mb-3">
                  Plataforma: {product.platform} | Región: {product.region} | Entrega: Digital
                </p>
                
                <div className="d-flex justify-content-between align-items-baseline mb-2">
                  <span className="h3 fw-bold text-primary">${product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="badge bg-primary bg-opacity-25 text-white">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
                
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-muted small text-decoration-line-through mb-2">
                    Precio original: ${product.originalPrice}
                  </p>
                )}
                
                <p className="text-muted small mb-3">
                  Stock: <span className="fw-bold text-white">{product.stock}</span>
                </p>

                <div className="d-grid gap-2 mb-3">
                  <Link
                    to="/cart"
                    className="btn btn-primary btn-lg py-2 fw-bold"
                    onClick={() => add(product)}
                  >
                    Comprar ahora
                  </Link>
                  <button
                    className="btn btn-outline-primary btn-lg py-2 fw-bold"
                    onClick={() => add(product)}
                  >
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
                  {PRODUCTS.filter(p => 
                    p.categories.some(cat => product.categories.includes(cat)) && 
                    p.id !== product.id
                  ).slice(0, 2).map((game, index) => (
                    <div key={index} className="d-flex gap-2">
                      <img
                        src={game.primaryImageUrl}
                        alt={game.title}
                        style={{ width: '60px', height: '80px', objectFit: 'cover' }}
                        className="rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/60x80/191229/ffffff?text=Imagen';
                        }}
                      />
                      <div>
                        <h6 className="text-white small mb-1">{game.title}</h6>
                        <p className="text-primary fw-bold mb-0 small">${game.price}</p>
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