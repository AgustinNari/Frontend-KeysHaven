import React from 'react';
import ProductCard from '../product/ProductCard';

export default function TopSellers({ products, onAdd }) {
  return (
    <div>
      <h5>Top sellers</h5>
      <div className="horizontal-list mt-2">
        {products.map(p => <ProductCard key={p.id} product={p} onAdd={() => onAdd(p)} />)}
      </div>
    </div>
  );
}
