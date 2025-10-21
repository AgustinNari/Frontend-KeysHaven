import React from "react";
import { Link } from "react-router-dom";
import Rating from "./Rating";
import { useCart } from "../../store/cart.jsx";

export default function ProductCard({ product }) {
  const { add } = useCart();

  const hasDiscount =
    product.originalPrice != null && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    add({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency ?? "USD",
      imageUrl: product.primaryImageUrl ?? null,
      platform: product.platform ?? null,
      region: product.region ?? null,
    });
  };

  return (
    <div className="product-card card">
      {product.primaryImageUrl ? (
        <div
          className="media"
          style={{
            backgroundImage: `url(${product.primaryImageUrl})`,
          }}
        />
      ) : (
        <div className="media no-image">
          <span>Imagen no disponible</span>
        </div>
      )}

      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div style={{ minWidth: 0 }}>
            <h3 className="h6 mb-1">{product.title}</h3>
            <div className="meta">{product.platform} • {product.region}</div>
            {/* NUEVO: vendedor */}
            {product.sellerDisplayName && (
              <div className="text-muted small mt-1">
                Vendedor: <span className="fw-semibold">{product.sellerDisplayName}</span>
              </div>
            )}
          </div>

          <div className="price text-end">
            {hasDiscount && (
              <div className="old">
                ${Number(product.originalPrice).toFixed(2)}
              </div>
            )}
            <div className="h6 mb-0">
              ${Number(product.price).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-auto bottom-row d-flex justify-content-between align-items-end">
          <div className="left-info">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Rating
                value={product.avgRating ?? 0}
                count={product.ratingCount ?? 0}
                size={14}
              />
            </div>
            <div className="meta-bottom">{product.sold ?? 0} vend.</div>
          </div>

          <div className="actions d-flex align-items-center gap-2">
            <div className="discount-placeholder">
              {hasDiscount && (
                <span className="badge bg-primary">-{discountPct}%</span>
              )}
            </div>
            <div className="action-buttons" role="group" aria-label="acciones producto">
              <button className="btn btn-sm btn-primary" onClick={handleAdd}>
                Al Carrito
              </button>
              <Link
                to={`/product/${product.id}`}
                className="btn btn-sm btn-outline-secondary"
              >
                Ver
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
