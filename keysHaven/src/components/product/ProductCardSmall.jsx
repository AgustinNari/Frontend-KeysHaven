import React from "react";
import { Link } from "react-router-dom";

export default function ProductCardSmall({ product }) {
  return (
    <div className="d-flex gap-2">
      <img src={product.primaryImageUrl} alt={product.title} style={{ width: 72, height: 90, objectFit: "cover", borderRadius: 6 }} />
      <div>
        <Link to={`/product/${product.id}`} className="text-white" style={{ fontWeight: 600 }}>{product.title}</Link>
        <div className="small text-muted">{product.platform}</div>
        <div className="text-primary fw-bold">${product.price}</div>
      </div>
    </div>
  );
}
