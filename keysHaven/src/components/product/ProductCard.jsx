import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../store/cart.jsx"; 

export default function ProductCard({ product, onAdd }) {
  const { add } = useCart();

  const id =
    product?.id ??
    product?.sku ??
    product?.code ??
    product?.title; 

  const title = product?.title ?? "Producto";
  const priceNum = Number(product?.price ?? 0);
  const currency = product?.currency ?? "$";
  const imgSrc = product?.imageUrl ?? product?.image ?? product?.img ?? null;
  const platform = product?.platform ?? "";
  const region = product?.region ?? "";

  const handleAdd = () => {
    if (typeof onAdd === "function") {
      onAdd(product);
      return;
    }

    add({
      id,
      title,
      price: priceNum,
      image: imgSrc,
      qty: 1,
      _raw: product, 
    });
  };

  return (
    <div className="card product-card">
      <Link to={`/product/${product?.id ?? id}`}>
        {imgSrc ? (
          <img
            src={imgSrc}
            className="card-img-top"
            alt={title}
            style={{ objectFit: "cover", height: 180 }}
          />
        ) : (
          <div
            className="card-img-top d-flex align-items-center justify-content-center text-muted"
            style={{ height: 180, background: "#f5f5f5" }}
          >
            Sin imagen
          </div>
        )}
      </Link>

      <div className="card-body d-flex flex-column">
        <h6 className="card-title">{title}</h6>
        <p className="card-text small text-muted">
          {platform}
          {platform && region ? " · " : ""}
          {region}
        </p>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          <strong>
            {currency} {priceNum.toFixed(2)}
          </strong>

          <div>
            <button onClick={handleAdd} className="btn btn-primary btn-sm me-2">
              Agregar
            </button>
            <Link
              to={`/product/${product?.id ?? id}`}
              className="btn btn-outline-secondary btn-sm"
            >
              Ver
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
