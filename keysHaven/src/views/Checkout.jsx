import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../store/cart.jsx";
import * as ordersService from "../services/orders";

export default function Checkout() {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    productDiscountTotal,
    couponDiscountTotal,
    discountTotal,
    total,
    currency,
    priceBreakdown,
    appliedCoupon,
    couponTargetProductId,
    clear,
    hasProductPercentDiscount
  } = useCart();

  const [placing, setPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const hasItems = items && items.length > 0;

  const handleConfirm = async () => {
    if (!hasItems || placing) return;
    setPlacing(true);
    setErrorMsg(null);
    try {
      const dtoItems = items.map((it) => {
        const productHasPercent = hasProductPercentDiscount(it);
        const couponCodeToSend =
          appliedCoupon && Number(couponTargetProductId) === Number(it.id) && !productHasPercent
            ? appliedCoupon.code
            : null;

        return {
          productId: Number(it.id),
          couponCode: couponCodeToSend,
          quantity: Number(it.qty),
        };
      });

      const orderDto = {
        items: dtoItems,
        notes: null,
      };

      const serverOrder = await ordersService.createOrder(orderDto);

      const clientItems = items.map(it => {
        const b = priceBreakdown(it);
        return {
          productId: it.id,
          title: it.title,
          qty: it.qty,
          image: it.image || it.imageUrl || (it._raw?.primaryImageDataUrl ?? it._raw?.primaryImageUrl) || null,
          line: {
            subtotal: b.lineSubtotal,
            productDiscount: b.productDiscount,
            couponDiscount: b.couponDiscount,
            total: b.lineTotal,
            unitOriginal: b.unitOriginal,
            unitFinal: b.unitFinal,
            productPercent: b.productPercent
          }
        };
      });

      clear();
      navigate("/order-confirmation", { state: { order: serverOrder, clientItems } });
    } catch (err) {
      console.error("Error creando orden", err);
      if (err?.status === 401) {
        setErrorMsg("Debes iniciar sesión para completar la compra.");
        navigate("/login");
      } else if (err?.body?.message) {
        setErrorMsg(err.body.message);
      } else {
        setErrorMsg(err.message || "Error al crear la orden");
      }
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

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

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
                      <div style = {{ color: "#8a4ff0" }} className="text small">
                        Cant: {it.qty}
                        {seller ? (
                          <>
                            {" "}
                            · Vendedor: <span className="fw-semibold">{seller}</span>
                          </>
                        ) : null}
                      </div>

                      <div style = {{ color: "#8a4ff0" }} className="text small mt-1">
                        Subtotal ítem: {currency} {b.lineSubtotal.toFixed(2)}
                        {b.productDiscount > 0 && (
                          <> · Desc. Producto ({b.productPercent}%): −{currency} {b.productDiscount.toFixed(2)}</>
                        )}
                        {b.couponDiscount > 0 && (
                          <> · Cupón {isCouponLine ? appliedCoupon?.code : ""}: −{currency} {b.couponDiscount.toFixed(2)}</>
                        )}
                      </div>
                    </div>

                    <div className="ms-3 text-end" style={{ minWidth: 140 }}>
                      {b.productPercent > 0 ? (
                        <>
                          <div style={{ fontSize: "0.85rem", color: "#6c757d", textDecoration: "line-through" }}>
                            {currency} {Number(b.unitOriginal).toFixed(2)} c/u
                          </div>
                          <div className="fw-semibold">
                            {currency} {Number(b.unitFinal).toFixed(2)} c/u
                          </div>
                        </>
                      ) : (
                        <div className="fw-semibold">{currency} {Number(b.unitOriginal).toFixed(2)} c/u</div>
                      )}

                      <div style={{ marginTop: 6 }}>
                        {(b.productDiscount > 0 || b.couponDiscount > 0) ? (
                          <>
                            <div style={{ fontSize: "0.85rem", color: "#6c757d", textDecoration: "line-through" }}>
                              {currency} {Number(b.lineSubtotal).toFixed(2)}
                            </div>
                            <div className="fw-semibold">{currency} {b.lineTotal.toFixed(2)}</div>
                          </>
                        ) : (
                          <div className="fw-semibold">{currency} {b.lineTotal.toFixed(2)}</div>
                        )}
                      </div>
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
                <span style = {{ color: "#8a4ff0" }}>Desc. por producto</span>
                <span className="text-danger">
                  −{currency} {productDiscountTotal.toFixed(2)}
                </span>
              </div>
              <div className="d-flex justify-content-between small">
                <span style = {{ color: "#8a4ff0" }}>
                  Cupón {appliedCoupon?.code ? `(${appliedCoupon.code})` : ""}
                </span>
                <span className="text-danger">
                  −{currency} {couponDiscountTotal.toFixed(2)}
                </span>
              </div>

              <div className="d-flex justify-content-between mt-1">
                <span className="fw-semibold">Descuentos</span>
                <span className="fw-semibold text-danger">
                  −{currency} {discountTotal.toFixed(2)}
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

          <div style = {{ color: "#8a4ff0" }}>
            * La entrega es digital, no hay costos de envío.
          </div>
        </div>
      </div>
    </div>
  );
}
