import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center">
      <h2>404 - Página no encontrada</h2>
      <p><Link to="/">Volver al Home</Link></p>
    </div>
  );
}
