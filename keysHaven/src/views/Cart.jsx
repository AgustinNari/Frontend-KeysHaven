import React from 'react';
import { Link } from 'react-router-dom';

export default function Cart() {
  return (
    <div>
      <h2>Carrito</h2>
      <p className="text-muted">Acá se verán los productos que agregues (placeholder).</p>

      <div className="card p-3">
        <p>No hay items todavía — esta es una vista provisional.</p>
        <Link to="/catalog" className="btn btn-link">Ir al catálogo</Link>
      </div>
    </div>
  );
}
