import React from "react";
import Rating from "../catalog/Rating";
import { Link } from "react-router-dom";


export default function RelatedProducts({ items = [] }) {
  if (!items || items.length === 0) return <div className="muted">No se encontraron productos relacionados.</div>;

  return (
    <div className="d-flex flex-column gap-3">
      {items.map(p => (
        <Link to={`/product/${p.id}`} key={p.id} className="related-item" style={{ textDecoration: 'none' }} onClick={() => window.scrollTo(0, 0)}>
          <img src={p.primaryImageUrl} alt={p.title} />
          <div>
            <div style={{ color: "var(--text)", fontWeight: 700 }}>{p.title}</div>
            <div className="meta" style={{ marginTop: 6 }}>
              <Rating value={p.avgRating ?? 0} count={p.ratingCount ?? 0} size={12} />
            </div>
            <div style={{ marginTop: 6, color: "var(--accent)", fontWeight: 700 }}>${p.price}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
