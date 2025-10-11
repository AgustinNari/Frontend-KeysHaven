import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams(); // sólo para demo, todavía no usamos datos reales

  return (
    <div>
      <h2>Detalle de producto</h2>
      <p className="text-muted">Producto id: <strong>{id || '[sin id]'}</strong></p>

      <div className="card p-3">
        <div style={{ width: '100%', height: '300px', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="text-muted">Imagen (placeholder)</span>
        </div>

        <h3 className="mt-3">Título del juego (placeholder)</h3>
        <p className="small text-muted">Plataforma - Región</p>
        <p>Descripción larga del juego (placeholder). Acá se mostrará la descripción real cuando conectes el backend.</p>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" disabled>Comprar ahora</button>
          <button className="btn btn-outline-secondary" disabled>Agregar al carrito</button>
          <Link to="/catalog" className="btn btn-link">Volver al catálogo</Link>
        </div>
      </div>
    </div>
  );
}
