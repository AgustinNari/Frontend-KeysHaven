// views/SellerDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import SellerCard from "../components/product/SellerCard";
import ProductGrid from "../components/catalog/ProductGrid";
import PaginationBar from "../components/catalog/PaginationBar";
import Rating from "../components/catalog/Rating";

import "../components/estilos/Fondos.css";
import "../components/estilos/product.css";

import { MOCK_SELLER_DETAIL } from "../data/mockSeller";
import { PRODUCTS } from "../data/products";

export default function SellerDetail() {
  const { sellerId } = useParams();

  // seller (mock)
  const [seller, setSeller] = useState(null);

  // products (filtered from PRODUCTS mock)
  const [allProducts, setAllProducts] = useState([]);

  // pagination state (page is 1-based because PaginationBar uses 1..N)
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    // Cargar mock seller (siempre usamos el mock para desarrollo)
    setSeller(MOCK_SELLER_DETAIL);

    // Filtrar products por sellerId (usamos el id del mock para consistencia)
    const sid = Number(MOCK_SELLER_DETAIL.id);
    const sellerProducts = (PRODUCTS || []).filter(p => Number(p.sellerId) === sid);

    setAllProducts(sellerProducts);
    // reset page al cambiar seller
    setPage(1);
  }, [sellerId]);

  if (!seller) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "40vh" }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  // pagination calculations
  const totalItems = allProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  // clamp page
  const safePage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = allProducts.slice(startIndex, endIndex);

  const displayName = seller.displayName || `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || "Vendedor";
  const avatar = seller.avatarDataUrl || seller.avatarUrl || "/src/assets/react.svg";
  const description = seller.sellerDescription || seller.description || "-";
  const avgRating = seller.avgRating ?? seller.avg_rating ?? 0;
  const ratingCount = seller.ratingCount ?? seller.rating_count ?? 0;
  const soldKeys = seller.soldKeys ?? seller.sold ?? seller.sales ?? 0;
  const amountSold = seller.amountSold ?? seller.revenue ?? 0;

  return (
    <div className="product-page">

      <div className="product-layout">
        <div className="product-left">
          <div className="card shadow-sm p-3 mb-3">
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <img src={avatar} alt={displayName} style={{ width: 96, height: 96, borderRadius: 12, objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, color: "var(--text)" }}>{displayName}</h2>
                <div className="muted" style={{ marginTop: 6 }}>{description}</div>

                <div className="seller-stats" style={{ marginTop: 10, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div className="seller-stat" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Rating value={avgRating} count={ratingCount} size={16} />
                    <small className="muted">({ratingCount})</small>
                  </div>

                  <div className="seller-stat muted">Ventas: <strong style={{ color: "var(--text)" }}>{soldKeys.toLocaleString()}</strong></div>
                  
                </div>
              </div>

            </div>
          </div>

          <div className="card shadow-sm p-3 mb-4">
            <h5 className="text-primary">Productos publicados</h5>

            {totalItems === 0 ? (
              <div className="muted mt-3">Este vendedor no tiene productos publicados (mock).</div>
            ) : (
              <>
                <div className="mt-3">
                  {/* usamos ProductGrid para renderizar la página actual */}
                  <ProductGrid products={pageItems} />
                </div>

                {/* Barra de paginación igual a la que usás en otras partes */}
                <div className="mt-3 d-flex justify-content-center">
                  <PaginationBar page={safePage} setPage={setPage} totalPages={totalPages} />
                </div>

                {/* info de páginas */}
                <div className="meta mt-2 text-center" style={{ color: "var(--muted)" }}>
                  Mostrando {startIndex + 1}–{Math.min(endIndex, totalItems)} de {totalItems} productos
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="product-right">
          <div className="card shadow-sm p-3 mb-3">
            <h6 style={{ color: "var(--text)" }}>Resumen del vendedor</h6>
            <div className="meta mt-2">
              <div>Rating: <strong style={{ color: "var(--text)" }}>{Number(avgRating).toFixed(1)}</strong></div>
              <div>Reseñas: <strong style={{ color: "var(--text)" }}>{ratingCount}</strong></div>
              <div>Keys vendidas: <strong style={{ color: "var(--text)" }}>{soldKeys.toLocaleString()}</strong></div>
            </div>
          </div>

    
          <div className="card shadow-sm p-3">
            <h6 style={{ color: "var(--text)" }}>Acciones</h6>
            <div className="d-grid gap-2 mt-2">
              <div className="muted" style={{ marginTop: 6 }}>
                Accede a la biblioteca de videojuegos de {displayName} desde el catálogo
              </div>

              {/* Opción 1: Link directo (simple) */}
              <Link to={`/catalog?sellerId=${seller.id}`} className="btn btn-outline-primary">
                Ver en catálogo
              </Link>

              {/* Opción 2: botón + navigate (idéntico visualmente, pero útil si quieres ejecutar lógica antes) */}
              {/* <button className="btn btn-outline-primary" onClick={goToCatalogFiltered}>Ver en catálogo</button> */}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
