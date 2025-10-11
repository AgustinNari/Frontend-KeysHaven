import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, onAdd }) {
  return (
    <div className="card product-card">
      <Link to={`/product/${product.id}`}>
        <img src={product.imageUrl} className="card-img-top" alt={product.title} />
      </Link>
      <div className="card-body d-flex flex-column">
        <h6 className="card-title">{product.title}</h6>
        <p className="card-text small text-muted">{product.platform} · {product.region}</p>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <strong>{product.currency} {product.price.toFixed(2)}</strong>
          <div>
            <button onClick={() => onAdd?.(product)} className="btn btn-primary btn-sm me-2">Agregar</button>
            <Link to={`/product/${product.id}`} className="btn btn-outline-secondary btn-sm">Ver</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
