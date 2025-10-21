import React, { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";

export default function OrderConfirmation() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <div className="container py-4">
        <h2>Confirmación de compra</h2>
        <div className="alert alert-warning mt-3">
          No encontramos una orden reciente.{" "}
          Volvé al <Link to="/catalog" className="alert-link">catálogo</Link> o al{" "}
          <Link to="/cart" className="alert-link">carrito</Link>.
        </div>
      </div>
    );
  }

  const currency = order.currency ?? "$";

  const safeItems = order.items.map(it => {
    const fallbackLineSubtotal = Number(it.price) * Number(it.qty);
    const line = it.line ?? {
      subtotal: fallbackLineSubtotal,
      bulkDiscount: 0,
      couponDiscount: 0,
      total: fallbackLineSubtotal,
    };
    return { ...it, line };
  });

  const { bulkSum, couponSum, discountsTotal } = useMemo(() => {
    const bulk = safeItems.reduce((n, it) => n + Number(it.line.bulkDiscount || 0), 0);
    const coup = safeItems.reduce((n, it) => n + Number(it.line.couponDiscount || 0), 0);
    const total = (order.discounts?.total != null)
      ? Number(order.discounts.total)
      : bulk + coup;
    return { bulkSum: bulk, couponSum: coup, discountsTotal: total };
  }, [safeItems, order.discounts]);

  const couponCode = order.discounts?.couponUsed ?? null;

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <img
          src="/src/assets/doppyHandsUp.png"
          alt="¡Gracias por tu compra!"
          style={{ width: 160, height: "auto", opacity: 0.95 }}
        />
        <h2 className="mt-3">¡Gracias por tu compra!</h2>
        <p className="text-muted mb-1">
          Orden <strong>{order.id}</strong>
        </p>
        <p className="text-muted">
          Fecha: {new Date(order.createdAt).toLocaleString()}
        </p>
        <div className="small text-muted">
          * La entrega es digital. Recibirás tus claves al instante.
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-header">Productos comprados</div>
            <div className="card-body">
              {safeItems.map((it) => (
                <div key={it.id} className="d-flex align-items-center mb-3">
                  {it.image ? (
                    <img
                      src={it.image}
                      alt={it.title}
                      style={{ width: 64, height: 64, objectFit: "cover" }}
                      className="me-3 rounded"
                    />
                  ) : (
                    <div
                      className="me-3 d-flex align-items-center justify-content-center text-muted"
                      style={{ width: 64, height: 64, background: "#f1f1f1", borderRadius: 8 }}
                    >
                      Sin imagen
                    </div>
                  )}

                  <div className="flex-grow-1">
                    <div className="fw-semibold">{it.title}</div>
                    <div className="text-muted small">
                      Cant: {it.qty} · {currency} {Number(it.price).toFixed(2)} c/u
                      {it.seller ? (
                        <> · Vendedor: <span className="fw-semibold">{it.seller}</span></>
                      ) : null}
                    </div>

                    <div className="small text-muted mt-1">
                      Subtotal ítem: {currency} {Number(it.line.subtotal).toFixed(2)}
                      {Number(it.line.bulkDiscount) > 0 && (
                        <> · Desc. Cantidad: −{currency} {Number(it.line.bulkDiscount).toFixed(2)}</>
                      )}
                      {Number(it.line.couponDiscount) > 0 && (
                        <> · Cupón {couponCode ? `(${couponCode})` : ""}: −{currency} {Number(it.line.couponDiscount).toFixed(2)}</>
                      )}
                    </div>
                  </div>

                  <div className="ms-2 fw-semibold">
                    {currency} {Number(it.line.total).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">Resumen</div>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <span>
                  {currency} {Number(order.subtotal ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="d-flex justify-content-between small">
                <span className="text-muted">Desc. por cantidad</span>
                <span className="text-danger">
                  −{currency} {bulkSum.toFixed(2)}
                </span>
              </div>

              <div className="d-flex justify-content-between small">
                <span className="text-muted">
                  Cupón {couponCode ? `(${couponCode})` : ""}
                </span>
                <span className="text-danger">
                  −{currency} {couponSum.toFixed(2)}
                </span>
              </div>

              <div className="d-flex justify-content-between mt-1">
                <span className="fw-semibold">Descuentos</span>
                <span className="fw-semibold text-danger">
                  −{currency} {discountsTotal.toFixed(2)}
                </span>
              </div>

              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>
                  {currency} {Number(order.total ?? 0).toFixed(2)}
                </span>
              </div>

              <Link to="/catalog" className="btn btn-primary w-100 mt-3">
                Seguir comprando
              </Link>
            </div>
          </div>

          <div className="text-muted small mt-2">
            Si necesitás ayuda con tu compra, escribinos desde tu perfil &gt; Órdenes.
          </div>
        </div>
      </div>
    </div>
  );
}
