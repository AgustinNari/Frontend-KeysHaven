import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../store/cart.jsx';
import { PRODUCTS } from '../data/products.js';
import { MOCK_REVIEWS } from '../data/mockReviews.js';
import "../components/estilos/Fondos.css";

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const [activeTab, setActiveTab] = useState('descripcion');
  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Simular llamada al endpoint /products/{id}/detail
        // En un entorno real, esto sería: const response = await fetch(`/api/products/${id}/detail`);
        const foundProduct = PRODUCTS.find(p => p.id === parseInt(id));
        
        if (foundProduct) {
          setProduct(foundProduct);
          
          // Simular imágenes dinámicas del producto
          // En un entorno real, esto vendría del endpoint product_images
          const mockImages = [
            {
              id: 1,
              productId: foundProduct.id,
              name: `${foundProduct.title} - Imagen principal`,
              isPrimary: true,
              file: foundProduct.primaryImageUrl,
              contentType: 'image/jpeg',
              dataUrl: foundProduct.primaryImageUrl
            },
            {
              id: 2,
              productId: foundProduct.id,
              name: `${foundProduct.title} - Gameplay 1`,
              isPrimary: false,
              file: foundProduct.primaryImageUrl, // En realidad sería otra URL
              contentType: 'image/jpeg',
              dataUrl: foundProduct.primaryImageUrl
            },
            {
              id: 3,
              productId: foundProduct.id,
              name: `${foundProduct.title} - Gameplay 2`,
              isPrimary: false,
              file: foundProduct.primaryImageUrl, // En realidad sería otra URL
              contentType: 'image/jpeg',
              dataUrl: foundProduct.primaryImageUrl
            }
          ];
          
          setProductImages(mockImages);

          // Buscar reviews del producto
          const productReviews = MOCK_REVIEWS.filter(r => r.productId === parseInt(id));
          setReviews(productReviews);

          // Buscar otros productos del mismo vendedor
          const sellerProds = PRODUCTS.filter(p => 
            p.sellerId === foundProduct.sellerId && p.id !== foundProduct.id
          ).slice(0, 3);
          setSellerProducts(sellerProds);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const getActiveImage = () => {
    if (productImages.length === 0) return product?.primaryImageUrl;
    return productImages[activeImageIndex]?.dataUrl || productImages[activeImageIndex]?.file;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <h4 className="text-white">Producto no encontrado</h4>
          <Link to="/catalog" className="btn btn-primary mt-3">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-bs-theme="dark" className="bg-primary-dark text-body d-flex justify-content-center align-items-center">
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
            {/* Imagen principal con miniaturas */}
            <div className="card shadow-sm mb-4">
              <div
                className="card-body p-0"
                style={{
                  height: '400px',
                  background: `linear-gradient(to top, rgba(25, 16, 34, 0.7) 0%, rgba(25, 16, 34, 0) 40%), url(${getActiveImage()}) center/cover`
                }}
              >
                {/* Indicadores de imágenes (puntos) */}
                <div className="d-flex justify-content-center gap-2" style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)' }}>
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      className={`rounded-circle border-0 ${activeImageIndex === index ? 'bg-white' : 'bg-white-50'}`}
                      style={{ 
                        width: '12px', 
                        height: '12px', 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Ver imagen ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Miniaturas de imágenes (opcional - puedes comentar esta sección si no la necesitas) */}
              {productImages.length > 1 && (
                <div className="card-footer bg-dark">
                  <div className="d-flex gap-2 justify-content-center">
                    {productImages.map((image, index) => (
                      <button
                        key={image.id}
                        className={`border-0 bg-transparent p-1 ${activeImageIndex === index ? 'border-primary' : ''}`}
                        style={{
                          border: activeImageIndex === index ? '2px solid #0d6efd' : '2px solid transparent',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img
                          src={image.dataUrl || image.file}
                          alt={image.name}
                          style={{
                            width: '60px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '2px'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resto del código permanece igual */}
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
                    },
                    {
                      platform: "Switch",
                      steps: [
                        "En tu consola Xbox, ve a la Tienda.",
                        "Selecciona 'Usar un código' en el menú.",
                        "Ingresa tu clave de juego y sigue las instrucciones."
                      ]
                    }
                  ].map((platform, index) => (
                    <div key={index} className="col-6">
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