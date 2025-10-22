// views/SellerDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import SellerCard from "../components/product/SellerCard";
import ProductGrid from "../components/catalog/ProductGrid";
import PaginationBar from "../components/catalog/PaginationBar";
import Rating from "../components/catalog/Rating";

import "../components/estilos/Fondos.css";
import "../components/estilos/product.css";

import { getSellerStats, getSellerActiveProducts } from "../services/sellerService";
import useApiError from "../hooks/useApiError";
import ApiErrorAlert from "../components/common/ApiErrorAlert";

export default function SellerDetail() {
  const { sellerId } = useParams();
  
  console.log("🔄 SellerDetail montado con sellerId:", sellerId);

  const [seller, setSeller] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [loading, setLoading] = useState(true);
  
  // Usar el hook de errores en lugar del estado de error simple
  const { apiError, setFrom, clear, hasError } = useApiError();

  const loadSellerData = async () => {
    try {
      setLoading(true);
      clear(); // Limpiar errores previos

      console.log("🔍 Iniciando carga de datos para sellerId:", sellerId);

      if (!sellerId) {
        setFrom(new Error("ID de vendedor no proporcionado"));
        return;
      }

      // Cargar estadísticas del seller
      console.log("📊 Llamando a getSellerStats...");
      const stats = await getSellerStats(sellerId);
      console.log("📊 Stats recibidas:", stats);
      
      if (!stats) {
        setFrom(new Error("Vendedor no encontrado en la base de datos"));
        return;
      }

      // Cargar productos activos del seller
      console.log("🎮 Llamando a getSellerActiveProducts...");
      const activeProducts = await getSellerActiveProducts(sellerId);
      console.log("🎮 Productos activos recibidos:", activeProducts);

      // Crear objeto seller con datos reales del backend
      const sellerData = {
        id: sellerId,
        displayName: stats.displayName || `Vendedor #${sellerId}`,
        sellerDescription: stats.sellerDescription || "Vendedor de productos digitales",
        avatarDataUrl: stats.avatarDataUrl || null,
        firstName: stats.firstName || "",
        lastName: stats.lastName || "",
        email: stats.email || "",
        phone: stats.phone || "",
        country: stats.country || "",
        
        // Estadísticas
        avgRating: stats.avgRating || 0,
        ratingCount: stats.ratingCount || 0,
        soldKeys: stats.soldKeys || 0,
        amountSold: stats.amountSold || 0,
        totalSales: stats.totalSales || 0,
        totalRevenue: stats.totalRevenue || 0,
        activeProducts: stats.activeProducts || 0,
        totalProducts: stats.totalProducts || 0
      };

      console.log("🛠️ Seller data construido:", sellerData);

      setSeller(sellerData);
      setAllProducts(activeProducts || []);
      setPage(1);

      console.log("✅ Datos cargados exitosamente");

    } catch (err) {
      console.error("❌ Error cargando datos del seller:", err);
      console.error("❌ Stack trace:", err.stack);
      setFrom(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🎯 useEffect ejecutándose con sellerId:", sellerId);
    if (sellerId) {
      loadSellerData();
    } else {
      setFrom(new Error("No se proporcionó ID de vendedor"));
      setLoading(false);
    }
  }, [sellerId]);

  // Función para reintentar la carga
  const handleRetry = () => {
    console.log("🔄 Reintentando carga de datos...");
    loadSellerData();
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "40vh" }}>
          <div className="spinner-border text-primary" role="status" />
          <span className="ms-2">Cargando información del vendedor...</span>
        </div>
      </div>
    );
  }

  // Estado de error
  if (hasError && !seller) {
    return (
      <div className="container mt-4">
        <ApiErrorAlert 
          error={apiError} 
          onRetry={handleRetry}
          onClose={clear}
        />
        <div className="text-center mt-3">
          <Link to="/catalog" className="btn btn-primary">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  // Vendedor no encontrado
  if (!seller) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Vendedor no encontrado</h4>
          <p>El vendedor que buscas no existe o ha sido eliminado.</p>
          <Link to="/catalog" className="btn btn-outline-primary">
            Explorar catálogo
          </Link>
        </div>
      </div>
    );
  }

  // Cálculos de paginación
  const totalItems = allProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pageItems = allProducts.slice(startIndex, endIndex);

  console.log("📦 Estado final - Seller:", seller);
  console.log("📦 Estado final - Productos:", allProducts.length);
  console.log("📦 Estado final - Página:", safePage, "de", totalPages);

  // Datos para mostrar
  const displayName = seller.displayName || 
    `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || 
    `Vendedor #${sellerId}`;
  
  const avatar = seller.avatarDataUrl || "/src/assets/react.svg";
  const description = seller.sellerDescription || "Sin descripción disponible";
  const avgRating = seller.avgRating || 0;
  const ratingCount = seller.ratingCount || 0;
  const soldKeys = seller.soldKeys || 0;

  return (
    <div className="container-fluid py-4">
      {/* Alertas de error (si existen) */}
      {hasError && (
        <div className="mb-4">
          <ApiErrorAlert 
            error={apiError} 
            onRetry={handleRetry}
            onClose={clear}
          />
        </div>
      )}

      {/* Contenido principal */}
      <div className="row">
        {/* Columna principal - Información del vendedor y productos */}
        <div className="col-lg-8 col-md-7">
          {/* Tarjeta principal del seller */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-4">
                <img 
                  src={avatar} 
                  alt={`Avatar de ${displayName}`}
                  className="rounded-3"
                  style={{ 
                    width: "120px", 
                    height: "120px", 
                    objectFit: "cover",
                    backgroundColor: seller.avatarDataUrl ? "transparent" : "#f8f9fa"
                  }} 
                  onError={(e) => {
                    e.target.src = "/src/assets/react.svg";
                  }}
                />
                <div className="flex-grow-1">
                  <h1 className="h3 mb-2 text-dark">{displayName}</h1>
                  <p className="text-muted mb-3">{description}</p>

                  <div className="d-flex flex-wrap gap-3 align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <Rating value={avgRating} count={ratingCount} size={20} />
                      <small className="text-muted">({ratingCount} reseñas)</small>
                    </div>

                    <div className="text-muted">
                      <i className="bi bi-bag-check me-1"></i>
                      Ventas: <strong className="text-dark">{soldKeys.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Productos del seller */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h5 card-title text-primary mb-4">
                <i className="bi bi-grid me-2"></i>
                Productos publicados ({totalItems})
              </h2>

              {totalItems === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox display-1 text-muted"></i>
                  <p className="text-muted mt-3">Este vendedor no tiene productos publicados.</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <ProductGrid products={pageItems} />
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mb-3">
                      <PaginationBar 
                        page={safePage} 
                        setPage={setPage} 
                        totalPages={totalPages} 
                      />
                    </div>
                  )}

                  <div className="text-center text-muted small">
                    Mostrando {startIndex + 1}–{endIndex} de {totalItems} productos
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Información adicional */}
        <div className="col-lg-4 col-md-5 mt-4 mt-md-0">
          {/* Resumen del vendedor */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h3 className="h6 card-title text-dark mb-3">
                <i className="bi bi-graph-up me-2"></i>
                Resumen del vendedor
              </h3>
              <div className="row small g-2">
                <div className="col-6">
                  <div className="text-muted">Rating promedio</div>
                  <div className="fw-semibold text-dark">{Number(avgRating).toFixed(1)}/5</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Reseñas</div>
                  <div className="fw-semibold text-dark">{ratingCount}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Keys vendidas</div>
                  <div className="fw-semibold text-dark">{soldKeys.toLocaleString()}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Ventas totales</div>
                  <div className="fw-semibold text-dark">{seller.totalSales || 0}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Productos activos</div>
                  <div className="fw-semibold text-dark">{seller.activeProducts || 0}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Total productos</div>
                  <div className="fw-semibold text-dark">{seller.totalProducts || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h3 className="h6 card-title text-dark mb-3">
                <i className="bi bi-person-lines-fill me-2"></i>
                Información de contacto
              </h3>
              <div className="small">
                {seller.email && (
                  <div className="mb-2">
                    <div className="text-muted">Email</div>
                    <div className="fw-semibold text-dark text-truncate">{seller.email}</div>
                  </div>
                )}
                {seller.phone && (
                  <div className="mb-2">
                    <div className="text-muted">Teléfono</div>
                    <div className="fw-semibold text-dark">{seller.phone}</div>
                  </div>
                )}
                {seller.country && (
                  <div>
                    <div className="text-muted">País</div>
                    <div className="fw-semibold text-dark">{seller.country}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="h6 card-title text-dark mb-3">
                <i className="bi bi-lightning me-2"></i>
                Acciones
              </h3>
              <p className="text-muted small mb-3">
                Accede a la biblioteca completa de videojuegos de {displayName} desde el catálogo
              </p>
              <Link 
                to={`/catalog?sellerId=${seller.id}`} 
                className="btn btn-outline-primary w-100"
              >
                <i className="bi bi-search me-2"></i>
                Ver en catálogo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}