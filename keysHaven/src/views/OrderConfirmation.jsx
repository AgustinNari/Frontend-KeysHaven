import React, { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";

export default function OrderConfirmation() {
  const { state } = useLocation();
  const serverOrder = state?.order;
  const clientItemsSnapshot = state?.clientItems ?? null;

  if (!serverOrder && !clientItemsSnapshot) {
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

  const normalizedItems = useMemo(() => {
    if (Array.isArray(clientItemsSnapshot) && clientItemsSnapshot.length > 0) {
      return clientItemsSnapshot.map(it => ({
        id: it.productId,
        title: it.title,
        qty: it.qty,
        image: it.image,
        line: {
          subtotal: Number(it.line.subtotal ?? 0),
          productDiscount: Number(it.line.productDiscount ?? 0),
          couponDiscount: Number(it.line.couponDiscount ?? 0),
          total: Number(it.line.total ?? 0),
          unitOriginal: Number(it.line.unitOriginal ?? it.price ?? 0),
          unitFinal: Number(it.line.unitFinal ?? 0),
          productPercent: Number(it.line.productPercent ?? 0)
        }
      }));
    }

    const srvItems = (serverOrder?.items ?? []).map(it => {
      const qty = Number(it.quantity ?? it.qty ?? 0);
      const unitPrice = Number(it.unitPrice ?? it.price ?? 0);
      const lineSubtotal = Number(it.lineSubtotal ?? (unitPrice * qty));
      const discountAmount = Number(it.discountAmount ?? 0);
      const lineTotal = Number(it.lineTotal ?? (lineSubtotal - discountAmount));
      return {
        id: it.productId ?? it.id ?? null,
        title: it.productTitle ?? it.title ?? "Producto",
        qty,
        image: null,
        line: {
          subtotal: lineSubtotal,
          productDiscount: 0,
          couponDiscount: discountAmount,
          total: lineTotal,
          unitOriginal: unitPrice,
          unitFinal: unitPrice
        }
      };
    });
    return srvItems;
  }, [clientItemsSnapshot, serverOrder]);

  const currency =
    (serverOrder && (serverOrder.currency ?? "$")) ||
    (clientItemsSnapshot && clientItemsSnapshot[0]?.line?.currency) ||
    "$";

  const totals = useMemo(() => {
    const subtotal = Number(serverOrder?.subtotal ?? serverOrder?.subtotalAmount ?? normalizedItems.reduce((n,it)=>n+it.line.subtotal,0));
    const total = Number(serverOrder?.totalAmount ?? serverOrder?.total ?? normalizedItems.reduce((n,it)=>n+it.line.total,0));
    const discountsTotalServer = Number(serverOrder?.discountAmount ?? serverOrder?.discounts?.total ?? 0);

    const productDiscountSum = normalizedItems.reduce((n,it) => n + Number(it.line.productDiscount || 0), 0);
    const couponDiscountSum = normalizedItems.reduce((n,it) => n + Number(it.line.couponDiscount || 0), 0);
    const discountsTotalClient = productDiscountSum + couponDiscountSum;

    const discountsTotal = discountsTotalServer > 0 ? discountsTotalServer : discountsTotalClient;

    return {
      subtotal,
      total,
      discountsTotal,
      productDiscountSum,
      couponDiscountSum
    };
  }, [serverOrder, normalizedItems]);

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
          Orden <strong>{serverOrder?.id ?? "(sin id)"}</strong>
        </p>
        <p style = {{ color: "#8a4ff0" }}>
          Fecha: {new Date(serverOrder?.createdAt ?? Date.now()).toLocaleString()}
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
              {normalizedItems.map((it) => (
                <div key={it.id ?? `${it.title}-${Math.random()}`} className="d-flex align-items-center mb-3">
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
                    <div style = {{ color: "#8a4ff0" }} className="text small">
                      Cant: {it.qty} · {currency} {Number(it.line.unitOriginal).toFixed(2)} c/u
                    </div>

                    <div style = {{ color: "#8a4ff0" }} className="text small mt-1">
                      Subtotal ítem: {currency} {Number(it.line.subtotal).toFixed(2)}
                      {Number(it.line.productDiscount) > 0 && (
                        <> · Desc. Producto: −{currency} {Number(it.line.productDiscount).toFixed(2)}</>
                      )}
                      {Number(it.line.couponDiscount) > 0 && (
                        <> · Cupón: −{currency} {Number(it.line.couponDiscount).toFixed(2)}</>
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
                  {currency} {Number(totals.subtotal).toFixed(2)}
                </span>
              </div>

              {(totals.productDiscountSum > 0 || totals.couponDiscountSum > 0) ? (
                <>
                  <div className="d-flex justify-content-between small">
                    <span style = {{ color: "#8a4ff0" }}>Desc. por producto</span>
                    <span className="text-danger">−{currency} {Number(totals.productDiscountSum).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span style = {{ color: "#8a4ff0" }}>Cupón</span>
                    <span className="text-danger">−{currency} {Number(totals.couponDiscountSum).toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="d-flex justify-content-between small">
                  <span style = {{ color: "#8a4ff0" }}>Descuentos</span>
                  <span className="text-danger">−{currency} {Number(totals.discountsTotal).toFixed(2)}</span>
                </div>
              )}

              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>
                  {currency} {Number(totals.total).toFixed(2)}
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
