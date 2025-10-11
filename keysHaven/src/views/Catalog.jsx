import React from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import PlaceholderGrid from '../components/ui/PlaceholderGrid';

export default function Catalog() {
  return (
    <div>
      <SectionTitle>Catálogo</SectionTitle>
      <p className="text-muted">Listado de productos (placeholder) — más adelante vendrán filtros y tarjetas reales.</p>

      <PlaceholderGrid count={8} />
    </div>
  );
}
