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

export default function SellerDetail() {
  const { sellerId } = useParams();

  const [seller, setSeller] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSellerData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Cargando datos para sellerId:", sellerId);

        // Cargar estadísticas del seller usando el endpoint real
        const stats = await getSellerStats(sellerId);
        console.log("📊 Stats recibidas:", stats);
        
        if (!stats) {
          setError("Vendedor no encontrado");
          return;
        }

        // Cargar productos activos del seller
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

      } catch (err) {
        console.error("❌ Error cargando datos del seller:", err);
        setError("No se pudo cargar la información del vendedor");
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      loadSellerData();
    }
  }, [sellerId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "40vh" }}>
        <div className="spinner-border text-primary" role="status" />
        <span className="ms-2">Cargando información del vendedor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
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
                    <small className="muted">({ratingCount})</small>
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
              <div>Rating: <strong style={{ color: "var(--text)" }}>{Number(avgRating).toFixed(1)}</strong></div>
              <div>Reseñas: <strong style={{ color: "var(--text)" }}>{ratingCount}</strong></div>
              <div>Keys vendidas: <strong style={{ color: "var(--text)" }}>{soldKeys.toLocaleString()}</strong></div>
              <div>Ventas totales: <strong style={{ color: "var(--text)" }}>{seller.totalSales || 0}</strong></div>
              {/* <div>Ingresos totales: <strong style={{ color: "var(--text)" }}>${(seller.totalRevenue || 0).toFixed(2)}</strong></div>*/}
              <div>Productos activos: <strong style={{ color: "var(--text)" }}>{seller.activeProducts || 0}</strong></div>
              <div>Total productos: <strong style={{ color: "var(--text)" }}>{seller.totalProducts || 0}</strong></div>
            </div>
          </div>

          <div className="card shadow-sm p-3">
            <h6 style={{ color: "var(--text)" }}>Información de contacto</h6>
            <div className="meta mt-2">
              {seller.email && <div>Email: <strong style={{ color: "var(--text)" }}>{seller.email}</strong></div>}
              {seller.phone && <div>Teléfono: <strong style={{ color: "var(--text)" }}>{seller.phone}</strong></div>}
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