import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import SellerCard from "../components/product/SellerCard";
import ProductGrid from "../components/catalog/ProductGrid";
import PaginationBar from "../components/catalog/PaginationBar";
import Rating from "../components/catalog/Rating";

import "../components/estilos/Fondos.css";
import "../components/estilos/product.css";

import { getSellerStats, getSellerActiveProductsForDetail } from "../services/sellerService";
import useApiError from "../hooks/useApiError";
import ApiErrorAlert from "../components/common/ApiErrorAlert";

export default function SellerDetail() {
  const { sellerId } = useParams();

  const [seller, setSeller] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  
  const { apiError, setFrom, clear, hasError } = useApiError();

  useEffect(() => {
    const loadSellerData = async () => {
      try {
        setLoading(true);
        clear(); 

        console.log("🔍 Cargando datos para sellerId:", sellerId);

        
        const stats = await getSellerStats(sellerId);
        console.log("📊 Stats recibidas:", stats);
        
        if (!stats) {
          setFrom(new Error("Vendedor no encontrado"));
          return;
        }

        // Devuelve los productos activos del vendedor
        const activeProducts = await getSellerActiveProductsForDetail(sellerId);
        console.log("🎮 Productos activos recibidos:", activeProducts);

        // Objeto Seller
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

      } catch (err) {
        console.error("❌ Error cargando datos del seller:", err);
        setFrom(err); // Usar setFrom en lugar de setError
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      loadSellerData();
    }
  }, [sellerId]);

  // Función para reintentar la carga
  const handleRetry = () => {
    if (sellerId) {
      const loadSellerData = async () => {
        try {
          setLoading(true);
          clear();
          // ... (misma lógica de carga)
          const stats = await getSellerStats(sellerId);
          if (!stats) {
            setFrom(new Error("Vendedor no encontrado"));
            return;
          }
          const activeProducts = await getSellerActiveProductsForDetail(sellerId);
          const sellerData = {
            // ... (misma construcción de datos)
            id: sellerId,
            displayName: stats.displayName || `Vendedor #${sellerId}`,
            sellerDescription: stats.sellerDescription || "Vendedor de productos digitales",
            avatarDataUrl: stats.avatarDataUrl || null,
            firstName: stats.firstName || "",
            lastName: stats.lastName || "",
            email: stats.email || "",
            phone: stats.phone || "",
            country: stats.country || "",
            avgRating: stats.avgRating || 0,
            ratingCount: stats.ratingCount || 0,
            soldKeys: stats.soldKeys || 0,
            amountSold: stats.amountSold || 0,
            totalSales: stats.totalSales || 0,
            totalRevenue: stats.totalRevenue || 0,
            activeProducts: stats.activeProducts || 0,
            totalProducts: stats.totalProducts || 0
          };
          setSeller(sellerData);
          setAllProducts(activeProducts || []);
          setPage(1);
        } catch (err) {
          setFrom(err);
        } finally {
          setLoading(false);
        }
      };
      loadSellerData();
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "40vh" }}>
        <div className="spinner-border text-primary" role="status" />
        <span className="ms-2">Cargando información del vendedor...</span>
      </div>
    );
  }

  if (hasError && !seller) {
    return (
      <div className="container mt-4">
        <ApiErrorAlert 
          error={apiError} 
          onRetry={handleRetry}
          onClose={clear}
        />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          Vendedor no encontrado
        </div>
      </div>
    );
  }

  // Cálculos de paginación
  const totalItems = allProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = allProducts.slice(startIndex, endIndex);

  // Datos para mostrar
  const displayName = seller.displayName || `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || `Vendedor #${sellerId}`;
  const avatar = seller.avatarDataUrl || "/src/assets/react.svg";
  const description = seller.sellerDescription || "-";
  const avgRating = seller.avgRating || 0;
  const ratingCount = seller.ratingCount || 0;
  const soldKeys = seller.soldKeys || 0;

  return (
    <div className="product-page">
      {hasError && (
        <div className="container mt-3">
          <ApiErrorAlert 
            error={apiError} 
            onRetry={handleRetry}
            onClose={clear}
          />
        </div>
      )}
      
      <div className="product-layout">
        <div className="product-left">
          {/* Tarjeta principal del seller */}
          <div className="card shadow-sm p-3 mb-3">
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <img 
                src={avatar} 
                alt={displayName} 
                style={{ 
                  width: 96, 
                  height: 96, 
                  borderRadius: 12, 
                  objectFit: "cover",
                  backgroundColor: seller.avatarDataUrl ? "transparent" : "#f8f9fa"
                }} 
              />
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, color: "var(--text)" }}>{displayName}</h2>
                <div className="muted" style={{ marginTop: 6 }}>{description}</div>

                <div className="seller-stats" style={{ marginTop: 10, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div className="seller-stat" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Rating value={avgRating} count={ratingCount} size={16} />
                  </div>

                  <div className="seller-stat muted">
                    Ventas: <strong style={{ color: "var(--text)" }}>{soldKeys.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Productos del seller */}
          <div className="card shadow-sm p-3 mb-4">
            <h5 className="text-primary">Productos publicados</h5>

            {totalItems === 0 ? (
              <div className="muted mt-3">Este vendedor no tiene productos publicados.</div>
            ) : (
              <>
                <div className="mt-3">
                  <ProductGrid products={pageItems} />
                </div>

                <div className="mt-3 d-flex justify-content-center">
                  <PaginationBar page={safePage} setPage={setPage} totalPages={totalPages} />
                </div>

                <div className="meta mt-2 text-center" style={{ color: "var(--muted)" }}>
                  Mostrando {startIndex + 1}–{Math.min(endIndex, totalItems)} de {totalItems} productos
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar con información adicional */}
        <aside className="product-right">
          <div className="card shadow-sm p-3 mb-3">
            <h6 style={{ color: "var(--text)" }}>Resumen del vendedor</h6>
            <div className="meta mt-2">
              <div>Rating: <strong style={{ color: "var(--text)" }}>{Number(avgRating/2).toFixed(1)}</strong></div>
              <div>Reseñas: <strong style={{ color: "var(--text)" }}>{ratingCount}</strong></div>
              <div>Keys vendidas: <strong style={{ color: "var(--text)" }}>{soldKeys.toLocaleString()}</strong></div>
            </div>
          </div>

          <div className="card shadow-sm p-3">
            <h6 style={{ color: "var(--text)" }}>Información de contacto</h6>
            <div className="meta mt-2">
              {seller.email && <div>Email: <strong style={{ color: "var(--text)" }}>{seller.email}</strong></div>}
              {seller.country && <div>País: <strong style={{ color: "var(--text)" }}>{seller.country}</strong></div>}
            </div>
          </div>

          <div className="card shadow-sm p-3">
            <h6 style={{ color: "var(--text)" }}>Acciones</h6>
            <div className="d-grid gap-2 mt-2">
              <div className="muted" style={{ marginTop: 6 }}>
                Accede a la biblioteca de videojuegos de {displayName} desde el catálogo
              </div>

              <Link to={`/catalog?sellerId=${seller.id}`} className="btn btn-outline-primary">
                Ver en catálogo
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}