import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../store/cart.jsx";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const [placing, setPlacing] = useState(false);

  const hasItems = items && items.length > 0;
  const shipping = 0; 
  const grandTotal = useMemo(() => (subtotal + shipping), [subtotal]);

  const handleConfirm = async () => {
    if (!hasItems || placing) return;
    setPlacing(true);
    try {
      const order = {
        id: `KH-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        items: items.map(it => ({
          id: it.id,
          title: it.title,
          price: Number(it.price),
          qty: Number(it.qty),
          image: it.image || it.imageUrl || null
        })),
        subtotal: Number(subtotal),
        shipping,
        total: Number(grandTotal)
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
          <Link to="/catalog" className="alert-link">Volver al catálogo</Link>.
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
              {items.map((it) => (
                <div key={it.id} className="d-flex align-items-center mb-3">
                  {(it.image || it.imageUrl) ? (
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
                    <div className="text-muted small">
                      Cant: {it.qty} · ${Number(it.price).toFixed(2)} c/u
                    </div>
                  </div>
                  <div className="ms-2 fw-semibold">
                    ${(Number(it.price) * Number(it.qty)).toFixed(2)}
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
                <span>${Number(subtotal).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Envío</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>${Number(grandTotal).toFixed(2)}</span>
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
        </div>
      </div>
    </div>
  );
}
