import React from "react";
import Rating from "./Rating";

export default function ProductCard({ product }) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div className="product-card card">
  <div className="media" style={{
    backgroundImage: `url(${product.primaryImageUrl || '/images/placeholder.png'})`,
  }} />

  <div className="card-body">
    <div className="d-flex justify-content-between align-items-start mb-2">
      <div style={{ minWidth: 0 }}>
        <h3 className="h6">{product.title}</h3>
        <div className="meta">{product.platform} • {product.region}</div>
      </div>

      <div className="price">
        {hasDiscount && <div className="old">${product.originalPrice.toFixed(2)}</div>}
        <div className="h6 mb-0">${product.price.toFixed(2)}</div>
      </div>
    </div>

    <div className="mt-auto bottom-row">
      <div className="left-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Rating value={product.avgRating ?? 0} count={product.ratingCount ?? 0} size={14} />
        </div>
        <div className="meta-bottom">{product.sold ?? 0} vend.</div>
      </div>

      <div className="actions">
        <div className="discount-placeholder">
          {hasDiscount && <span className="badge bg-primary">-{discountPct}%</span>}
        </div>
        <div className="action-buttons" role="group" aria-label="acciones producto">
          <button className="btn btn-sm btn-primary">Al Carrito</button>
          <button className="btn btn-sm btn-outline-secondary">Ver</button>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}
