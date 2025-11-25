import React, { useState } from "react";
import { Link } from "react-router-dom";
import Rating from "./Rating";
import { useCart } from "../../store/cart.jsx";

import { useAppSelector } from "../../redux/hooks";
import { selectUser } from "../../redux/slices/authSlice";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const user = useAppSelector(selectUser);
  const [toast, setToast] = useState(null);

  const hasDiscount =
    (product.bestDiscountFrac != null && Number(product.bestDiscountFrac) > 0) ||
    (product.bestDiscountPercentage != null && Number(product.bestDiscountPercentage) > 0);
  const discountFrac =
    product.bestDiscountFrac ??
    (product.bestDiscountPercentage != null ? Number(product.bestDiscountPercentage) / 100 : null);
  const discountPct = hasDiscount && discountFrac != null ? Math.round(discountFrac * 100) : 0;

  const baseOriginalPrice = Number(product.price ?? 0);
  const displayPrice = (hasDiscount && product.discountedPrice != null) ? Number(product.discountedPrice) : baseOriginalPrice;

  const isAdmin = user?.role === "ADMIN";
  const isSellerOwner = user?.role === "SELLER" && String(user?.id) === String(product?.sellerId);
  const blockedPurchase = isAdmin || isSellerOwner;

  function showToast(text, type = "warn", duration = 2400) {
    setToast({ text, type });
    setTimeout(() => setToast(null), duration);
  }

  const addToCartSafe = async () => {
    if (blockedPurchase) {
      if (isAdmin) showToast("El administrador no puede comprar productos");
      else showToast("No se pueden comprar productos propios");
      return;
    }

    const res = await add({
      id: product.id,
      title: product.title,
      price: baseOriginalPrice,
      currency: product.currency ?? "USD",
      imageUrl: product.primaryImageUrl ?? product.primaryImageDataUrl ?? null,
      platform: product.platform ?? null,
      region: product.region ?? null,
      _raw: {
        id: product.id,
        price: baseOriginalPrice,
        bestDiscount: product.bestDiscount ?? (product.bestDiscountPercentage != null ? { type: "PERCENT", value: product.bestDiscountPercentage } : null),
        primaryImageDataUrl: product.primaryImageDataUrl ?? product.primaryImageUrl ?? null,
        availableStock: product.availableStock ?? product.stock ?? null
      }
    }, 1);

    if (!res || !res.ok) {
      const reason = res?.reason ?? "No se pudo agregar al carrito";
      showToast(reason, "warn");
    } else {
      showToast("Añadido al carrito", "info");
    }
  };

  return (
    <div className="product-card card" style={{ position: "relative" }}>
      {product.primaryImageUrl ? (
        <div
          className="media"
          style={{
            backgroundImage: `url(${product.primaryImageUrl})`,
          }}
        />
      ) : (
        <div className="media no-image">
          <span>Imagen no disponible</span>
        </div>
      )}

      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div style={{ minWidth: 0 }}>
            <h3 className="h6 mb-1">{product.title}</h3>
            <div className="meta">{product.platform} • {product.region}</div>
            {product.sellerDisplayName && (
              <div style={{color: "#8a4ff0"}} className="text small">
                Vendedor: <span className="fw-semibold">{product.sellerDisplayName}</span>
              </div>
            )}
          </div>

          <div className="price text-end">
            {hasDiscount && (
              <div className="old" style={{textDecoration: "line-through", opacity: 0.8}}>
                ${baseOriginalPrice.toFixed(2)}
              </div>
            )}
            <div className="h6 mb-0">
              ${displayPrice.toFixed(2)}
            </div>
            <div className="discount-placeholder">
              {hasDiscount && (
                <span className="badge bg-primary">-{discountPct}%</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto bottom-row d-flex justify-content-between align-items-end">
          <div className="left-info">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Rating
                value={product.avgRating ?? 0}
                count={product.ratingCount ?? 0}
                size={14}
              />
            </div>
            <div className="meta-bottom">{product.sold ?? 0} vend.</div>
          </div>

          <div className="actions d-flex align-items-center gap-2">

            <div className="action-buttons" role="group" aria-label="acciones producto">
              <button
                className={`btn btn-sm ${blockedPurchase ? "btn-secondary" : "btn-primary"}`}
                onClick={addToCartSafe}
                aria-disabled={blockedPurchase}
                title={blockedPurchase ? (isAdmin ? "Administrador: no puede comprar" : "No puedes comprar tus propios productos") : "Agregar al carrito"}
              >
                Al Carrito
              </button>

              <Link
                to={`/product/${product.id}`}
                className="btn btn-sm btn-outline-secondary"
              >
                Ver
              </Link>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 2000,
          minWidth: 220
        }}>
          <div className={`alert ${toast.type === "warn" ? "alert-warning" : "alert-info"} py-2 mb-0`} role="alert" style={{ margin: 0 }}>
            <small style={{ fontWeight: 600 }}>{toast.text}</small>
          </div>
        </div>
      )}
    </div>
  );
}
