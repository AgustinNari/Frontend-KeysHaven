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

  const normalize = (rawOrder) => {
    const currency = rawOrder.currency ?? "$";
    const createdAt = rawOrder.createdAt ?? rawOrder.created_at ?? new Date().toISOString();

    const safeItems = (rawOrder.items || []).map(it => {
      const qty = Number(it.quantity ?? it.qty ?? 0);
      const unitPrice = Number(it.unitPrice ?? it.price ?? 0);
      const lineSubtotal = Number(it.lineSubtotal ?? it.line?.subtotal ?? (unitPrice * qty));
      const bulkDiscount = Number(it.line?.bulkDiscount ?? 0);
      const couponDiscount = Number(it.line?.couponDiscount ?? it.line?.discountAmount ?? 0);
      const total = Number(it.lineTotal ?? it.line?.total ?? it.line?.lineTotal ?? (lineSubtotal - bulkDiscount - couponDiscount));
      const image = it.image ?? it.imageUrl ?? it.primaryImageUrl ?? null;
      return {
        id: it.productId ?? it.id ?? null,
        title: it.productTitle ?? it.title ?? "Producto",
        qty: isNaN(qty) ? 0 : qty,
        price: isNaN(unitPrice) ? 0 : unitPrice,
        image,
        seller: it.seller ?? it.sellerDisplayName ?? null,
        line: {
          subtotal: isNaN(lineSubtotal) ? 0 : lineSubtotal,
          bulkDiscount: isNaN(bulkDiscount) ? 0 : bulkDiscount,
          couponDiscount: isNaN(couponDiscount) ? 0 : couponDiscount,
          total: isNaN(total) ? 0 : total,
        }
      };
    });

    const subtotal = Number(rawOrder.subtotal ?? rawOrder.subtotalAmount ?? rawOrder.total ?? 0);
    const discountsTotal = Number(rawOrder.discountAmount ?? rawOrder.discounts?.total ?? rawOrder.discounts?.total ?? 0);
    const total = Number(rawOrder.totalAmount ?? rawOrder.total ?? rawOrder.totalAmount ?? rawOrder.totalAmount ?? rawOrder.total ?? 0);

    const couponCode = rawOrder.discounts?.couponUsed ?? rawOrder.discounts?.coupon ?? null;

    return {
      id: rawOrder.id ?? null,
      createdAt,
      currency,
      items: safeItems,
      subtotal: isNaN(subtotal) ? 0 : subtotal,
      discountsTotal: isNaN(discountsTotal) ? 0 : discountsTotal,
      total: isNaN(total) ? safeItems.reduce((n, it) => n + Number(it.line.total || 0), 0) : total,
      couponCode
    };
  };

  const normalized = normalize(order);
  const currency = normalized.currency ?? "$";

  const { bulkSum, couponSum, discountsTotal } = useMemo(() => {
    const bulk = normalized.items.reduce((n, it) => n + Number(it.line.bulkDiscount || 0), 0);
    const coup = normalized.items.reduce((n, it) => n + Number(it.line.couponDiscount || 0), 0);
    const totalDiscount = Number(normalized.discountsTotal ?? (bulk + coup));
    return { bulkSum: bulk, couponSum: coup, discountsTotal: totalDiscount };
  }, [normalized]);

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <img
          src="/src/assets/doppyKnight/doppyJump.png"
          alt="¡Gracias por tu compra!"
          style={{ width: 160, height: "auto", opacity: 0.95 }}
        />
        <h2 className="mt-3">¡Gracias por tu compra!</h2>
        <p style = {{ color: "#e6dbff" }}>
          Orden <strong>{normalized.id ?? "(sin id)"}</strong>
        </p>
        <p style = {{ color: "#8a4ff0" }}>
          Fecha: {new Date(normalized.createdAt).toLocaleString()}
        </p>
        <div style = {{ color: "#8a4ff0" }}>
          * La entrega es digital. Recibirás tus claves al instante y las podrás ver en tu perfil de usuario.
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-header">Productos comprados</div>
            <div className="card-body">
              {normalized.items.map((it) => (
                <div key={it.id ?? `${it.title}-${Math.random()}`} className="d-flex align-items-center mb-3">
                  {it.image || it.imageUrl ? (
                    <img
                      src={it.image || it.imageUrl}
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
                    <div style = {{ color: "#8a4ff0" }} className="text small">
                      Cant: {it.qty} · {currency} {Number(it.price).toFixed(2)} c/u
                      {it.seller ? (
                        <> · Vendedor: <span className="fw-semibold">{it.seller}</span></>
                      ) : null}
                    </div>

                    <div style = {{ color: "#8a4ff0" }} className="text small">
                      Subtotal ítem: {currency} {Number(it.line.subtotal).toFixed(2)}
                      {Number(it.line.bulkDiscount) > 0 && (
                        <> · Desc. Cantidad: −{currency} {Number(it.line.bulkDiscount).toFixed(2)}</>
                      )}
                      {Number(it.line.couponDiscount) > 0 && (
                        <> · Cupón {normalized.couponCode ? `(${normalized.couponCode})` : ""}: −{currency} {Number(it.line.couponDiscount).toFixed(2)}</>
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
                  {currency} {Number(normalized.subtotal ?? normalized.items.reduce((n, it) => n + Number(it.line.subtotal || 0), 0)).toFixed(2)}
                </span>
              </div>

              <div className="d-flex justify-content-between small">
                <span style = {{ color: "#8a4ff0" }}>Desc. por cantidad</span>
                <span className="text-danger">
                  −{currency} {bulkSum.toFixed(2)}
                </span>
              </div>

              <div className="d-flex justify-content-between small">
                <span style = {{ color: "#8a4ff0" }}>
                  Cupón {normalized.couponCode ? `(${normalized.couponCode})` : ""}
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
                  {currency} {Number(normalized.total ?? normalized.items.reduce((n, it) => n + Number(it.line.total || 0), 0)).toFixed(2)}
                </span>
              </div>

              <Link to="/catalog" className="btn btn-primary w-100 mt-3">
                Seguir comprando
              </Link>
            </div>
          </div>

          <div style = {{ color: "#8a4ff0" }} className="text small">
            Si necesitás ayuda con tu compra, escribinos desde tu perfil &gt; Órdenes.
          </div>
        </div>
      </div>
    </div>
  );
}
