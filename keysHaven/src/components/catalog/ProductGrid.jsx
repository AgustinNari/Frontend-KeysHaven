import React from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [] }) {
  return (
    <div className="product-grid mt-3">
      {products.map(p => (
        <div className="card" key={p.id}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
