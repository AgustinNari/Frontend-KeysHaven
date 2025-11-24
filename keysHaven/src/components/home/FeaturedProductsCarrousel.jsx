import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import productsService from "../../services/productsService";
import Loading from "../../assets/doppyKnight/doppyTimeCheck.png";

export default function FeaturedProductsCarousel() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await productsService.getFeaturedProducts(10); // Usar el nuevo servicio
        setFeaturedProducts(response.content || response || []);
      } catch (err) {
        console.error("Failed to load featured products", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    if (featuredProducts.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  const nextProduct = () => {
    setCurrentIndex(currentIndex === featuredProducts.length - 1 ? 0 : currentIndex + 1);
  };

  const prevProduct = () => {
    setCurrentIndex(currentIndex === 0 ? featuredProducts.length - 1 : currentIndex - 1);
  };

  const goToProduct = (index) => {
    setCurrentIndex(index);
  };

  // Función para obtener la imagen principal del producto
  const getPrimaryImage = (product) => {
    if (product.primaryImageDataUrl) return product.primaryImageDataUrl;
    if (product.primaryImageUrl) return product.primaryImageUrl;
    if (product.imageUrls && product.imageUrls.length > 0) return product.imageUrls[0];
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.isPrimary) || product.images[0];
      return primary.dataUrl || primary.file || null;
    }
    return null;
  };

  // Función para obtener el precio mostrado (con descuento si aplica)
  const getDisplayPrice = (product) => {
    if (product.discountedPrice != null) {
      return product.discountedPrice;
    }
    return product.price ? Number(product.price) : 0;
  };

  // Función para obtener stock disponible
  const getAvailableStock = (product) => {
    return product.availableStock || product.stock || 0;
  };

  if (loading) {
    return (
      <section className="py-5 bg-primary-dark">
        <div className="container">
          <h2 className="fw-bold text-center mb-5 text-primary-light">
            Productos Destacados
          </h2>
          <div className="col-12 d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
            <img
              src={Loading}
              alt="Loading..."
              style={{ width: "120px", height: "160px" }}
            />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-5 bg-primary-dark">
        <div className="container">
          <h2 className="fw-bold text-center mb-5 text-primary-light">
            Productos Destacados
          </h2>
          <div className="col-12 text-center" style={{ height: "300px", color: "red" }}>
            <p>Error cargando productos destacados: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredProducts || featuredProducts.length === 0) {
    return (
      <section className="py-5 bg-primary-dark">
        <div className="container">
          <h2 className="fw-bold text-center mb-5 text-primary-light">
            Productos Destacados
          </h2>
          <div className="col-12 text-center" style={{ color: "var(--muted)", height: "300px" }}>
            <p>No hay productos destacados en este momento</p>
          </div>
        </div>
      </section>
    );
  }

  const currentProduct = featuredProducts[currentIndex];

  return (
    <section className="py-5 bg-primary-dark">
      <div className="container">
        <h2 className="fw-bold text-center mb-5 text-primary-light">
          Productos Destacados
        </h2>

        <div className="row justify-content-center">
          <div className="col-10">
            <div className="card shadow-lg border-0 rounded-3 bg-primary-mid">
              <div className="card-body p-4">
                {/* Controles del carousel */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={prevProduct}
                    disabled={featuredProducts.length <= 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  
                  <div className="d-flex gap-2">
                    {featuredProducts.map((_, index) => (
                      <button
                        key={index}
                        className={`btn btn-sm ${
                          index === currentIndex ? 'btn-primary' : 'btn-outline-primary'
                        }`}
                        onClick={() => goToProduct(index)}
                        style={{ width: '12px', height: '12px', borderRadius: '50%', padding: 0 }}
                      />
                    ))}
                  </div>
                  
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={nextProduct}
                    disabled={featuredProducts.length <= 1}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>

                {/* Contenido del producto actual */}
                <div className="row align-items-center">
                  {/* Imagen del producto con enlace */}
                  <div className="col-md-6 text-center mb-4 mb-md-0">
                    <Link 
                      to={`/product/${currentProduct.id}`}
                      className="text-decoration-none"
                    >
                      {getPrimaryImage(currentProduct) ? (
                        <img
                          src={getPrimaryImage(currentProduct)}
                          alt={currentProduct.title}
                          className="img-fluid rounded shadow"
                          style={{ 
                            maxHeight: '300px', 
                            width: 'auto',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      ) : (
                        <div 
                          className="bg-secondary rounded d-flex align-items-center justify-content-center"
                          style={{ 
                            height: '300px', 
                            width: '200px', 
                            margin: '0 auto',
                            transition: 'transform 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                          <i className="fas fa-gamepad fa-3x text-light"></i>
                        </div>
                      )}
                    </Link>
                  </div>

                  {/* Información del producto */}
                  <div className="col-md-6">
                    <div className="d-flex flex-column h-100">
                      {/* Título y categorías */}
                      <div className="mb-3">
                        <Link 
                          to={`/product/${currentProduct.id}`}
                          className="text-decoration-none"
                        >
                          <h3 
                            className="text-light mb-2"
                            style={{
                              transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text)'}
                          >
                            {currentProduct.title}
                          </h3>
                        </Link>
                        
                        {currentProduct.categories && currentProduct.categories.length > 0 && (
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {currentProduct.categories.map((category, index) => (
                              <span 
                                key={index}
                                className="badge bg-primary bg-opacity-25 text-white border border-primary border-opacity-25"
                                style={{ 
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}
                              >
                                {category.description}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Descripción */}
                      <div className="mb-3 flex-grow-1">
                        <p className="text-light" style={{ 
                          lineHeight: '1.5',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {currentProduct.description || 'Descripción no disponible'}
                        </p>
                      </div>

                      {/* Plataforma y región */}
                      <div className="row text-sm mb-3">
                        <div className="col-6">
                          <strong className="text-primary-light">Plataforma:</strong>
                          <br />
                          <span className="text-light">{currentProduct.platform}</span>
                        </div>
                        <div className="col-6">
                          <strong className="text-primary-light">Región:</strong>
                          <br />
                          <span className="text-light">{currentProduct.region}</span>
                        </div>
                      </div>

                      {/* Precio y stock */}
                      <div className="row text-sm mb-4">
                        <div className="col-6">
                          <strong className="text-primary-light">Precio:</strong>
                          <br />
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-light fw-bold fs-5">
                              ${getDisplayPrice(currentProduct).toFixed(2)}
                            </span>
                            {currentProduct.discountedPrice && (
                              <span 
                                className="text-muted text-decoration-line-through"
                                style={{ fontSize: '0.9rem' }}
                              >
                                ${Number(currentProduct.price).toFixed(2)}
                              </span>
                            )}
                          </div>
                          {currentProduct.discountPctDisplay > 0 && (
                            <span className="badge bg-success mt-1">
                              {currentProduct.discountPctDisplay}% OFF
                            </span>
                          )}
                        </div>
                        <div className="col-6">
                          <strong className="text-primary-light">Stock:</strong>
                          <br />
                          <span className={`badge ${
                            getAvailableStock(currentProduct) > 0 
                              ? 'bg-success' 
                              : 'bg-danger'
                          }`}>
                            {getAvailableStock(currentProduct)} disponibles
                          </span>
                        </div>
                      </div>

                      {/* Botón para ver detalles */}
                      <div className="d-flex flex-column flex-sm-row gap-2 justify-content-start">
                        <Link 
                          to={`/product/${currentProduct.id}`}
                          className="btn btn-primary"
                          style={{ minWidth: '160px' }}
                        >
                          <i className="fas fa-info-circle me-2"></i>
                          Ver Detalles del Juego
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}