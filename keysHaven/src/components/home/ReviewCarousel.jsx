// components/home/ReviewCarousel.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getLatestReviews } from "../../services/reviews";
import productsService from "../../services/productsService";
import Loading from "../../assets/doppyKnight/doppyTimeCheck.png";
import Rating from "../catalog/Rating";

export default function ReviewCarousel() {
  const [reviews, setReviews] = useState([]);
  const [reviewsWithCategories, setReviewsWithCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchLatestReviewsWithCategories = async () => {
      try {
        setLoading(true);
        const latestReviews = await getLatestReviews(5);
        setReviews(latestReviews || []);

        // Obtener categorías para cada producto desde el frontend
        const reviewsWithCatData = await Promise.all(
          (latestReviews || []).map(async (review) => {
            try {
              const productDetail = await productsService.getById(review.productId);
              const categories = productDetail?.categories?.map(cat => cat.description) || [];
              return {
                ...review,
                productCategories: categories
              };
            } catch (err) {
              console.error(`Error loading categories for product ${review.productId}:`, err);
              return {
                ...review,
                productCategories: []
              };
            }
          })
        );

        setReviewsWithCategories(reviewsWithCatData);
      } catch (err) {
        console.error("Failed to load latest reviews", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestReviewsWithCategories();
  }, []);

  // Auto-rotación del carousel
  useEffect(() => {
    if (reviewsWithCategories.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === reviewsWithCategories.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [reviewsWithCategories.length]);

  const nextReview = () => {
    setCurrentIndex(currentIndex === reviewsWithCategories.length - 1 ? 0 : currentIndex + 1);
  };

  const prevReview = () => {
    setCurrentIndex(currentIndex === 0 ? reviewsWithCategories.length - 1 : currentIndex - 1);
  };

  const goToReview = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <section className="py-5 bg-primary-dark">
        <div className="container">
          <h2 className="fw-bold text-center mb-5 text-primary-light">
            Reseñas Recientes de Nuestros Clientes
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
            Reseñas Recientes de Nuestros Clientes
          </h2>
          <div className="col-12 text-center text-muted" style={{ height: "300px" }}>
            <p>Error cargando las reseñas: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!reviewsWithCategories || reviewsWithCategories.length === 0) {
    return (
      <section className="py-5 bg-primary-dark">
        <div className="container">
          <h2 className="fw-bold text-center mb-5 text-primary-light">
            Reseñas Recientes de Nuestros Clientes
          </h2>
          <div className="col-12 text-center text-muted" style={{ height: "300px" }}>
            <p>No hay reseñas recientes</p>
          </div>
        </div>
      </section>
    );
  }

  const currentReview = reviewsWithCategories[currentIndex];

  return (
    <section className="py-5 bg-primary-dark">
      <div className="container">
        <h2 className="fw-bold text-center mb-5 text-primary-light">
          Reseñas Recientes de Nuestros Clientes
        </h2>

        <div className="row justify-content-center">
          <div className="col-10">
            <div className="card shadow-lg border-0 rounded-3 bg-primary-mid">
              <div className="card-body p-4">
                {/* Controles del carousel */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={prevReview}
                    disabled={reviewsWithCategories.length <= 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  
                  <div className="d-flex gap-2">
                    {reviewsWithCategories.map((_, index) => (
                      <button
                        key={index}
                        className={`btn btn-sm ${
                          index === currentIndex ? 'btn-primary' : 'btn-outline-primary'
                        }`}
                        onClick={() => goToReview(index)}
                        style={{ width: '12px', height: '12px', borderRadius: '50%', padding: 0 }}
                      />
                    ))}
                  </div>
                  
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={nextReview}
                    disabled={reviewsWithCategories.length <= 1}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>

                {/* Contenido de la review actual */}
                <div className="row align-items-stretch"> {/* Cambiado a align-items-stretch */}
                  {/* Imagen del producto con enlace */}
                  <div className="col-md-4 text-center mb-3 mb-md-0">
                    <Link 
                      to={`/product/${currentReview.productId}`}
                      className="text-decoration-none"
                    >
                      {currentReview.productImageDataUrl ? (
                        <img
                          src={currentReview.productImageDataUrl}
                          alt={currentReview.productTitle}
                          className="img-fluid rounded shadow"
                          style={{ 
                            maxHeight: '200px', 
                            width: 'auto',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      ) : (
                        <div className="bg-secondary rounded d-flex align-items-center justify-content-center"
                             style={{ 
                               height: '200px', 
                               width: '150px', 
                               margin: '0 auto',
                               transition: 'transform 0.3s ease'
                             }}
                             onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                             onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                          <i className="fas fa-gamepad fa-3x text-light"></i>
                        </div>
                      )}
                    </Link>
                  </div>

                  {/* Información de la review - NUEVO LAYOUT */}
                  <div className="col-8">
                    <div className="d-flex flex-column h-100">
                        <div className="d-flex justify-content-start align-items-center mb-2">
                          <Rating 
                            value={currentReview.rating} 
                            size={20} 
                            max={10}
                            count={0}
                          />
                          <span className="ms-2 text-light" style={{ fontSize: '1.1rem' }}>
                            {currentReview.rating}/10
                          </span>
                        </div>
                      
                      {/* Contenedor principal: comentario + categorías */}
                      {/* Rating y título */}
                    <div className="d-flex flex-row mb-3">
                      <div className="col-6">
                      

                        <Link 
                          to={`/product/${currentReview.productId}`}
                          className="text-decoration-none"
                        >
                          <h5 
                            className="text-light mt-1 mb-1"
                            style={{
                              transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text)'}
                          >
                            {currentReview.title}
                          </h5>
                        </Link>
                        {/* Comentario - lado izquierdo */}
                        <div className="">
                          <div className="h-100 d-flex align-items-center">
                            <p className="text-light m-0" style={{ 
                              fontStyle: 'italic',
                              lineHeight: '1.5'
                            }}>
                              "{currentReview.comment}"
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Categorías - lado derecho */}
                      <div className="col-6 ms-3">
                        <div className="">
                          {currentReview.productCategories && currentReview.productCategories.length > 0 && (
                            <div className="h-100 d-flex flex-column">
                              <strong className="text-primary-light d-block mb-2">Categorías</strong>
                              <div className="d-flex gap-1 align-items-start">
                                {currentReview.productCategories.map((category, index) => (
                                  <span 
                                    key={index}
                                    className="badge bg-primary bg-opacity-25 text-white border border-primary border-opacity-25"
                                    style={{ 
                                      fontSize: '0.75rem',
                                      fontWeight: '500',
                                      width: 'fit-content'
                                    }}
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                      

                      {/* Información del producto y usuario */}
                      <div className="row text-sm mb-3">
                        <div className="col-6">
                          <strong className="text-primary-light">Juego:</strong>
                          <br />
                          <Link 
                            to={`/product/${currentReview.productId}`}
                            className="text-decoration-none text-primary fw-semibold"
                          >
                            {currentReview.productTitle}
                          </Link>
                        </div>
                        <div className="col-6">
                          <strong className="text-primary-light ">Usuario:</strong>
                          <br />
                          <span className="text-light">{currentReview.buyerDisplayName}</span>
                        </div>
                      </div>

                      {/* Fecha */}
                      <div className="mb-3">
                        <small className="text-muted">
                          {new Date(currentReview.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </small>
                      </div>

                      {/* BOTÓN PARA VER DETALLES DEL PRODUCTO */}
                      <div className="d-flex flex-column flex-sm-row gap-2 justify-content-start mt-auto">
                        <Link 
                          to={`/product/${currentReview.productId}`}
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