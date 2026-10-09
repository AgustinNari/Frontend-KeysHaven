import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../store/cart.jsx";
import "../components/estilos/cart.css";

import DoppyCart from "../assets/doppyKnight/doppyShoppingCart.png"

export default function Cart() {
  const {
    items,
    inc,
    dec,
    remove,
    clear,
    subtotal,
    productDiscountTotal,
    couponDiscountTotal,
    total,
    currency,
    appliedCoupon,
    couponTargetProductId,
    applyCouponByCode,
    removeCoupon,
    priceBreakdown,
    availableCoupons,
    fetchAvailableCoupons,
    refreshCart,
    hasProductPercentDiscount,
  } = useCart();

  useEffect(() => { fetchAvailableCoupons(); refreshCart(); }, [fetchAvailableCoupons, refreshCart]);

  const [selection, setSelection] = useState({});
  const [msg, setMsg] = useState(null);

  const hasItems = items.length > 0;

  const applicableCouponsById = useMemo(() => {
    const map = {};
    for (const it of items) {
      map[it.id] = (availableCoupons || []).filter(
        (c) => c.active &&
          (c.scope !== 'PRODUCT' || Number(c.targetProductId) === Number(it.id)) &&
          (c.scope !== 'SELLER' || Number(c.targetSellerId) === Number(it._raw?.sellerId)) &&
          (c.scope !== 'CATEGORY' || it._raw?.categories?.some(category => Number(category.id) === Number(c.targetCategoryId)))
      );
    }
    return map;
  }, [items, availableCoupons]);

  const handleApply = async (productId) => {
    const code = selection[productId];
    if (!code) {
      setMsg({ type: "warning", text: "Elegí un cupón para aplicar." });
      return;
    }

    const it = items.find(i => Number(i.id) === Number(productId));
    if (it && hasProductPercentDiscount(it)) {
      setMsg({ type: "warning", text: "No se puede aplicar cupón a productos que ya tienen descuento por producto." });
      return;
    }
    const res = await applyCouponByCode(code, productId);
    if (!res.ok) {
      setMsg({ type: "danger", text: res.reason || "No se pudo aplicar el cupón." });
    } else {
      setMsg({ type: "success", text: `Cupón ${code} aplicado al producto seleccionado.` });
    }
  };

  if (!hasItems) {
    return (
      <div>
        <h2>Carrito</h2>
        <div className="card p-3">
          <p>No hay items todavía — Ir al catálogo para agregarlos.</p>
          <Link to="/catalog" className="btn btn-link" style = {{ color: "#8a4ff0" }}>
            Ir al catálogo
          </Link>
        </div>
        <div
          className="col-12 d-flex justify-content-center"
          style={{ position: "relative", zIndex: 2 }}
        >
          <img
            src={DoppyCart}
            alt="Doppy"
            width={450}
            height={620}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Carrito</h2>

      {msg && (
        <div className={`alert alert-${msg.type} py-2`} role="alert">
          {msg.text}
        </div>
      )}

      <div className="mb-2">
        <small style={{ color: "#8a4ff0" }}>
          <strong>Nota:</strong> Sólo se permite <strong>1 cupón por compra</strong>. Si aplicás un cupón a un ítem, no podrás aplicar otro cupón a otro ítem en la misma orden.
        </small>
      </div>

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th style={{ width: 60 }}></th>
              <th>Producto</th>
              <th className="text-center" style={{ width: 140 }}>
                Cantidad
              </th>
              <th className="text-end" style={{ width: 140 }}>
                Precio
              </th>
              <th className="text-end" style={{ width: 140 }}>
                Total
              </th>
              <th style={{ width: 280 }}>Cupón</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const b = priceBreakdown(it);
              const seller =
                it.sellerDisplayName ??
                it._raw?.sellerDisplayName ??
                it._raw?._raw?.sellerDisplayName ??
                null;

              const isCouponRow =
                appliedCoupon && Number(couponTargetProductId) === Number(it.id);
              const canApplySomewhereElse = !appliedCoupon || isCouponRow;

              const options = applicableCouponsById[it.id] || [];
              const itemHasProductDiscount = hasProductPercentDiscount(it);

              return (
                <tr key={it.id}>
                  <td>
                    {it.image || it.imageUrl ? (
                      <img
                        src={it.image || it.imageUrl}
                        alt={it.title}
                        style={{
                          width: 32,
                          height: 48,
                          objectFit: "contain",
                          borderRadius: 6,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 6,
                          background: "#eee",
                        }}
                      />
                    )}
                  </td>

                  <td>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-semibold">{it.title}</div>
                        <div className="text-muted small">
                          {it.platform ?? ""} {it.region ? `· ${it.region}` : ""}
                          {seller ? (
                            <>
                              {" "}
                              · <span className="text-body-secondary">Vendedor:</span>{" "}
                              <span className="fw-semibold">{seller}</span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {itemHasProductDiscount && (
                        <div>
                          <span className="badge bg-warning text-dark" title="Este producto ya tiene descuento por producto; no acepta cupones.">
                            Descuento aplicado — no acepta cupón
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="small text-muted mt-1">
                      Subtotal ítem: {b.currency} {b.lineSubtotal.toFixed(2)}
                      {b.productDiscount > 0 && (
                        <>
                          {" "}
                          · Desc. Producto ({b.productPercent}%): −{b.currency}{" "}
                          {b.productDiscount.toFixed(2)}
                        </>
                      )}
                      {b.couponDiscount > 0 && (
                        <>
                          {" "}
                          · Cupón {b.couponCode}: −{b.currency}{" "}
                          {b.couponDiscount.toFixed(2)}
                        </>
                      )}
                    </div>
                  </td>

                  <td className="text-center">
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={async () => { const result = await dec(it.id); if (!result.ok) setMsg({ type: 'warning', text: result.reason }); }}
                      >
                        −
                      </button>
                      <span className="btn btn-light disabled">{it.qty}</span>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={async () => {
                          const res = await inc(it.id);
                          if (!res || !res.ok) {
                            setMsg({ type: "warning", text: res?.reason ?? "No se pudo aumentar la cantidad" });
                            setTimeout(() => setMsg(null), 2600);
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td className="text-end">
                    {b.productPercent > 0 ? (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.85rem", color: "#6c757d", textDecoration: "line-through" }}>
                          {b.currency} {Number(b.unitOriginal).toFixed(2)}
                        </div>
                        <div className="fw-semibold">
                          {b.currency} {Number(b.unitFinal).toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="fw-semibold text-end">
                        {it.currency} {Number(it.price).toFixed(2)}
                      </div>
                    )}
                  </td>

                  <td className="text-end fw-semibold">
                    <div style={{ textAlign: "right" }}>
                      {(b.productDiscount > 0 || b.couponDiscount > 0) ? (
                        <>
                          <div style={{ fontSize: "0.85rem", color: "#6c757d", textDecoration: "line-through" }}>
                            {b.currency} {Number(b.lineSubtotal).toFixed(2)}
                          </div>
                          <div>{b.currency} {b.lineTotal.toFixed(2)}</div>
                        </>
                      ) : (
                        <div>{b.currency} {b.lineTotal.toFixed(2)}</div>
                      )}
                    </div>
                  </td>

                  <td>
                    {isCouponRow ? (
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success-subtle text-success-emphasis">
                          Cupón {appliedCoupon.code} aplicado
                        </span>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={removeCoupon}
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex gap-2">
                        <select
                          className="form-select form-select-sm"
                          value={selection[it.id] || ""}
                          onChange={(e) =>
                            setSelection((s) => ({ ...s, [it.id]: e.target.value }))
                          }
                          disabled={
                            !canApplySomewhereElse ||
                            options.length === 0 ||
                            itemHasProductDiscount
                          }
                          title={
                            itemHasProductDiscount
                              ? "Este producto ya tiene descuento por producto; no se pueden aplicar cupones."
                              : ""
                          }
                        >
                          <option value="">
                            {options.length
                              ? itemHasProductDiscount
                                ? "No se pueden aplicar cupones"
                                : "Elegí un cupón…"
                              : "Sin cupones aplicables"}
                          </option>
                          {options.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code} —{" "}
                              {c.type === "PERCENT" || c.type === "percent"
                                ? `${c.value}%`
                                : `-${currency} ${c.value}`}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          disabled={
                            !canApplySomewhereElse ||
                            !selection[it.id] ||
                            options.length === 0 ||
                            itemHasProductDiscount
                          }
                          onClick={() => handleApply(it.id)}
                        >
                          Aplicar
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => remove(it.id)}
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={3}></td>
              <td className="text-end">Subtotal</td>
              <td className="text-end">{currency} {subtotal.toFixed(2)}</td>
              <td colSpan={2}></td>
            </tr>

            <tr>
              <td colSpan={3}></td>
              <td className="text-end">Desc. por producto</td>
              <td className="text-end text-danger">
                −{currency} {productDiscountTotal.toFixed(2)}
              </td>
              <td colSpan={2}></td>
            </tr>

            <tr>
              <td colSpan={3}></td>
              <td className="text-end">Cupón</td>
              <td className="text-end text-danger">
                −{currency} {couponDiscountTotal.toFixed(2)}
              </td>
              <td colSpan={2}></td>
            </tr>

            <tr>
              <td colSpan={3}></td>
              <td className="text-end fw-bold">Total</td>
              <td className="text-end fw-bold">
                {currency} {total.toFixed(2)}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="d-flex flex-wrap gap-2">
        <button className="btn btn-outline-secondary" onClick={clear}>
          Vaciar
        </button>
        <Link to="/catalog" className="btn btn-light">
          Seguir comprando
        </Link>
        <Link to="/paymentmethod" className="btn btn-primary ms-auto">
          Continuar compra
        </Link>
      </div>
    </div>
  );
}
