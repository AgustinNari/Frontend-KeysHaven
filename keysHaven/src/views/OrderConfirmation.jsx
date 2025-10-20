import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function OrderConfirmation() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <div className="container py-4">
        <h2>Confirmación de compra</h2>
        <div className="alert alert-warning mt-3">
          No encontramos una orden reciente.
          {" "}Volvé al <Link to="/catalog" className="alert-link">catálogo</Link> o al{" "}
          <Link to="/cart" className="alert-link">carrito</Link>.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h2>¡Gracias por tu compra!</h2>
        <p className="text-muted mb-1">Orden <strong>{order.id}</strong></p>
        <p className="text-muted">Fecha: {new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-header">Productos comprados</div>
            <div className="card-body">
              {order.items.map((it) => (
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
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Envío</span>
                <span>${Number(order.shipping).toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>

              <Link to="/catalog" className="btn btn-primary w-100 mt-3">
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
