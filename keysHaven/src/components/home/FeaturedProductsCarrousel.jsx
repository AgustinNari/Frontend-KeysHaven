// components/home/FeaturedProductsCarousel.jsx
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
        const response = await productsService.getFeaturedProducts(10);
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

  if (loading) {
    return (
      <section className="py-5 bg-primary-dark">
        <div className="container">
          <h2 className="fw-bold text-center mb-5 text-primary-light">
            Productos Destacados
          </h2>
          <div className="col-12 d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
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
          <div className="col-12 text-center" style={{ height: "400px", color: "red" }}>
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
          <div className="col-12 text-center" style={{ color: "var(--muted)", height: "400px" }}>
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
          <div className="col-12 col-lg-10">
            <div className="card shadow-lg border-0 rounded-3 bg-primary-mid overflow-hidden">
              {/* Imagen del producto que ocupa casi todo el carrusel */}
              <div className="position-relative" style={{ height: "400px" }}>
                <Link 
                  to={`/product/${currentProduct.id}`}
                  className="text-decoration-none d-block h-100"
                >
                  {getPrimaryImage(currentProduct) ? (
                    <img
                      src={getPrimaryImage(currentProduct)}
                      alt={currentProduct.title}
                      className="img-fluid w-100 h-100"
                      style={{ 
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
                      onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                    />
                  ) : (
                    <div 
                      className="bg-secondary w-100 h-100 d-flex align-items-center justify-content-center"
                      style={{ 
                        transition: "transform 0.3s ease",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
                      onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                    >
                      <i className="fas fa-gamepad fa-5x text-light"></i>
                    </div>
                  )}
                </Link>

                {/* Controles del carousel superpuestos en la imagen */}
                <button 
                  className="btn btn-outline-primary position-absolute top-50 start-0 translate-middle-y ms-3"
                  onClick={prevProduct}
                  disabled={featuredProducts.length <= 1}
                  style={{ zIndex: 10 }}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                <button 
                  className="btn btn-outline-primary position-absolute top-50 end-0 translate-middle-y me-3"
                  onClick={nextProduct}
                  disabled={featuredProducts.length <= 1}
                  style={{ zIndex: 10 }}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>

                {/* Indicadores superpuestos en la imagen */}
                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3" style={{ zIndex: 10 }}>
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
                </div>
              </div>

              {/* Información del producto debajo de la imagen */}
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    {/* Título */}
                    <Link 
                      to={`/product/${currentProduct.id}`}
                      className="text-decoration-none"
                    >
                      <h4 
                        className="text-light mb-2"
                        style={{
                          transition: "color 0.3s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.color = "var(--accent)"}
                        onMouseLeave={(e) => e.target.style.color = "var(--text)"}
                      >
                        {currentProduct.title}
                      </h4>
                    </Link>
                    
                    {/* Categorías */}
                    {currentProduct.categories && currentProduct.categories.length > 0 && (
                      <div className="d-flex flex-wrap gap-2">
                        {currentProduct.categories.map((category, index) => (
                          <span 
                            key={index}
                            className="badge bg-primary bg-opacity-25 text-white border border-primary border-opacity-25"
                            style={{ 
                              fontSize: "0.75rem",
                              fontWeight: "500"
                            }}
                          >
                            {category.description}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    {/* Precio */}
                    <div className="d-flex flex-column align-items-md-end">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="text-light fw-bold fs-4">
                          ${getDisplayPrice(currentProduct).toFixed(2)}
                        </span>
                        {currentProduct.discountedPrice && (
                          <span 
                            className="text-muted text-decoration-line-through"
                            style={{ fontSize: "1rem" }}
                          >
                            ${Number(currentProduct.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {currentProduct.discountPctDisplay > 0 && (
                        <span className="badge bg-success">
                          {currentProduct.discountPctDisplay}% OFF
                        </span>
                      )}
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