
import React from "react";
import Rating from "../catalog/Rating";

export default function SellerCard({ seller }) {
  if (!seller) return null;
  return (
    <div className="card p-3 seller-card">
      <img className="seller-avatar" src={seller.avatarDataUrl} alt={seller.displayName} />
      <div className="seller-info">
        <h6>{seller.displayName}</h6>
        <div className="muted" style={{ marginTop: 4 }}>{seller.sellerDescription}</div>
        <div className="seller-stats">
          <div className="seller-stat"><Rating value={Math.round((seller.avgRating || 0))} count={seller.ratingCount} size={14} /></div>
          <div className="seller-stat muted">Ventas: <strong style={{ color: "var(--text)" }}>{seller.soldKeys ?? 0}</strong></div>
        </div>
      </div>
    </div>
  );
}
