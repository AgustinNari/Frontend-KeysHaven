import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../store/cart.jsx";

export default function Checkout() {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    discountTotal,
    total,
    currency,
    priceBreakdown,
    appliedCoupon,
    couponTargetProductId,
    clear,
  } = useCart();

  const [placing, setPlacing] = useState(false);
  const hasItems = items && items.length > 0;

  const { bulkSum, couponSum } = useMemo(() => {
    let bulk = 0,
      coup = 0;
    for (const it of items) {
      const b = priceBreakdown(it);
      bulk += b.bulkDiscount;
      coup += b.couponDiscount;
    }
    return { bulkSum: bulk, couponSum: coup };
  }, [items, priceBreakdown]);

  const handleConfirm = async () => {
    if (!hasItems || placing) return;
    setPlacing(true);
    try {
      const order = {
        id: `KH-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        currency,
        items: items.map((it) => {
          const b = priceBreakdown(it);
          return {
            id: it.id,
            title: it.title,
            price: Number(it.price),
            qty: Number(it.qty),
            image: it.image || it.imageUrl || null,
            seller: it.sellerDisplayName ?? it._raw?.sellerDisplayName ?? null,
            line: {
              subtotal: b.lineSubtotal,
              bulkDiscount: b.bulkDiscount,
              couponDiscount: b.couponDiscount,
              total: b.lineTotal,
            },
          };
        }),
        subtotal: Number(subtotal),
        discounts: {
          bulk: bulkSum,
          coupon: couponSum,
          total: Number(discountTotal),
          couponUsed: appliedCoupon?.code ?? null,
          couponTargetProductId: couponTargetProductId ?? null,
        },
        total: Number(total),
      };

      clear(); 
      navigate("/order-confirmation", { state: { order } });
    } finally {
      setPlacing(false);
    }
  };

  if (!hasItems) {
    return (
      <div className="container py-4">
        <h2>Checkout</h2>
        <div className="alert alert-info mt-3">
          Tu carrito está vacío.{" "}
          <Link to="/catalog" className="alert-link">
            Volver al catálogo
          </Link>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2>Checkout</h2>

      <div className="row mt-3">
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-header">Productos</div>
            <div className="card-body">
              {items.map((it) => {
                const b = priceBreakdown(it);
                const seller =
                  it.sellerDisplayName ?? it._raw?.sellerDisplayName ?? null;
                const isCouponLine =
                  appliedCoupon &&
                  Number(couponTargetProductId) === Number(it.id);

                return (
                  <div key={it.id} className="d-flex align-items-center mb-3">
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
                        style={{
                          width: 64,
                          height: 64,
                          background: "#f1f1f1",
                          borderRadius: 8,
                        }}
                      >
                        Sin imagen
                      </div>
                    )}

                    <div className="flex-grow-1">
                      <div className="fw-semibold">{it.title}</div>
                      <div className="text-muted small">
                        Cant: {it.qty} · {currency} {Number(it.price).toFixed(2)} c/u
                        {seller ? (
                          <>
                            {" "}
                            · Vendedor: <span className="fw-semibold">{seller}</span>
                          </>
                        ) : null}
                      </div>

                      <div className="small text-muted mt-1">
                        Subtotal ítem: {currency} {b.lineSubtotal.toFixed(2)}
                        {b.bulkDiscount > 0 && (
                          <>
                            {" "}
                            · Desc. Cantidad: −{currency}{" "}
                            {b.bulkDiscount.toFixed(2)}
                          </>
                        )}
                        {b.couponDiscount > 0 && (
                          <>
                            {" "}
                            · Cupón {isCouponLine ? appliedCoupon?.code : ""}: −
                            {currency} {b.couponDiscount.toFixed(2)}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="ms-2 fw-semibold">
                      {currency} {b.lineTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
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
                  {currency} {Number(subtotal).toFixed(2)}
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
                  Cupón {appliedCoupon?.code ? `(${appliedCoupon.code})` : ""}
                </span>
                <span className="text-danger">
                  −{currency} {couponSum.toFixed(2)}
                </span>
              </div>

              <div className="d-flex justify-content-between mt-1">
                <span className="fw-semibold">Descuentos</span>
                <span className="fw-semibold text-danger">
                  −{currency} {Number(discountTotal).toFixed(2)}
                </span>
              </div>

              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>
                  {currency} {Number(total).toFixed(2)}
                </span>
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                disabled={!hasItems || placing}
                onClick={handleConfirm}
              >
                {placing ? "Procesando..." : "Confirmar compra"}
              </button>

              <Link to="/cart" className="btn btn-link w-100 mt-2">
                Volver al carrito
              </Link>
            </div>
          </div>

          <div className="text-muted small mt-2">
            * La entrega es digital, no hay costos de envío.
          </div>
        </div>
      </div>
    </div>
  );
}
