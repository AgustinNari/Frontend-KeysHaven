import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../store/cart.jsx";

export default function Cart() {
  const {
    items,
    inc,
    dec,
    remove,
    clear,
    subtotal,
    discountTotal,
    total,
    currency,
    appliedCoupon,
    couponTargetProductId,
    applyCouponByCode,
    removeCoupon,
    priceBreakdown,
    availableCoupons,
  } = useCart();

  const [selection, setSelection] = useState({});
  const [msg, setMsg] = useState(null);

  const hasItems = items.length > 0;

  const applicableCouponsById = useMemo(() => {
    const map = {};
    for (const it of items) {
      map[it.id] = (availableCoupons || []).filter(
        (c) => c.active && (!c.productIds?.length || c.productIds.includes(Number(it.id)))
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
      </div>
    );
  }

  return (
    <div>
      <h2>Carrito</h2>

      {msg && (
        <div className={`alert alert-${msg.type} py-2`} role="alert">
          {msg.text}
        </div>
      )}

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th style={{ width: 60 }}></th>
              <th>Producto</th>
              <th className="text-center" style={{ width: 140 }}>
                Cantidad
              </th>
              <th className="text-end" style={{ width: 120 }}>
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

              return (
                <tr key={it.id}>
                  <td>
                    {it.image || it.imageUrl ? (
                      <img
                        src={it.image || it.imageUrl}
                        alt={it.title}
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: "cover",
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

                    <div className="small text-muted mt-1">
                      Subtotal ítem: {b.currency} {b.lineSubtotal.toFixed(2)}
                      {b.bulkDiscount > 0 && (
                        <>
                          {" "}
                          · Desc. Cantidad ({b.bulkPercent}%): −{b.currency}{" "}
                          {b.bulkDiscount.toFixed(2)}
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
                        onClick={() => dec(it.id)}
                      >
                        −
                      </button>
                      <span className="btn btn-light disabled">{it.qty}</span>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => inc(it.id)}
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td className="text-end">
                    {it.currency} {Number(it.price).toFixed(2)}
                  </td>

                  <td className="text-end fw-semibold">
                    {b.currency} {b.lineTotal.toFixed(2)}
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
                          disabled={!canApplySomewhereElse || options.length === 0}
                        >
                          <option value="">
                            {options.length
                              ? "Elegí un cupón…"
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
                            options.length === 0
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
              <td className="text-end text-danger">Descuentos</td>
              <td className="text-end text-danger">
                −{currency} {discountTotal.toFixed(2)}
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

      <div className="d-flex gap-2">
        <button className="btn btn-outline-secondary" onClick={clear}>
          Vaciar
        </button>
        <Link to="/catalog" className="btn btn-light">
          Seguir comprando
        </Link>
        <Link to="/checkout" className="btn btn-primary ms-auto">
          Continuar compra
        </Link>
      </div>
    </div>
  );
}
