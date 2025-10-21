// views/SellerDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import SellerCard from "../components/product/SellerCard";
import ProductCard from "../components/catalog/ProductCard";
import Rating from "../components/catalog/Rating";

import "../components/estilos/Fondos.css";
import "../components/estilos/product.css";

import { MOCK_SELLER_DETAIL } from "../data/mockSeller";
import { PRODUCTS } from "../data/products";

export default function SellerDetail() {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Usamos el mock del seller (si el id coincide usamos el mock,
    // si no, mostramos el mock igualmente para desarrollo)
    // Convertimos sellerId a number por si viene como string
    const idNum = Number(sellerId);

    // Si el mock corresponde al id pedido lo usamos, sino usamos igualmente el mismo mock
    // (esto facilita probar /seller/1 o /seller/999 sin backend)
    if (MOCK_SELLER_DETAIL && (MOCK_SELLER_DETAIL.id === idNum || Number.isNaN(idNum))) {
      setSeller(MOCK_SELLER_DETAIL);
    } else {
      // si el id no es el del mock, igual mostramos el mock (desarrollo)
      setSeller(MOCK_SELLER_DETAIL);
    }

    // Filtramos productos por sellerId en PRODUCTS (mock)
    const sellerProducts = PRODUCTS.filter((p) => Number(p.sellerId) === (MOCK_SELLER_DETAIL.id));
    setProducts(sellerProducts);
  }, [sellerId]);

  if (!seller) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "40vh" }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const displayName = seller.displayName || `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || "Vendedor";
  const avatar = seller.avatarDataUrl || seller.avatarUrl || "/src/assets/react.svg";
  const description = seller.sellerDescription || seller.description || "-";
  const avgRating = seller.avgRating ?? seller.avg_rating ?? 0;
  const ratingCount = seller.ratingCount ?? seller.rating_count ?? 0;
  const soldKeys = seller.soldKeys ?? seller.sold ?? seller.sales ?? 0;
  const amountSold = seller.amountSold ?? seller.revenue ?? 0;

  return (
    <div className="product-page">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/catalog">Catálogo</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{displayName}</li>
        </ol>
      </nav>

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
                  <div className="seller-stat muted">Ingresos: <strong style={{ color: "var(--text)" }}>${Number(amountSold).toLocaleString()}</strong></div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <Link to={`/seller/${seller.id}/contact`} className="btn btn-outline-primary btn-sm">Contactar</Link>
              </div>
            </div>
          </div>

          <div className="card shadow-sm p-3 mb-4">
            <h5 className="text-primary">Información</h5>
            <div className="mt-2 meta">
              <div><strong>Nombre:</strong> {seller.firstName ?? "-" } {seller.lastName ?? ""}</div>
              <div><strong>Email:</strong> {seller.email ?? "—"}</div>
              <div><strong>Teléfono:</strong> {seller.phone ?? "—"}</div>
              <div><strong>País:</strong> {seller.country ?? "—"}</div>
            </div>
          </div>

          <div className="card shadow-sm p-3">
            <h5 className="text-primary">Productos publicados</h5>

            {products.length === 0 ? (
              <div className="muted mt-3">Este vendedor no tiene productos publicados (mock).</div>
            ) : (
              <div className="row g-3 mt-2">
                {products.map((p) => (
                  <div key={p.id} className="col-6 col-md-4 col-lg-3">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
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
              <Link to={`/seller/${seller.id}/products`} className="btn btn-outline-primary">Ver todos los productos</Link>
              <Link to="/catalog" className="btn btn-primary">Explorar catálogo</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
