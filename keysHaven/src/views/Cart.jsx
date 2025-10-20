import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../store/cart.jsx";

export default function Cart() {
  const { items, inc, dec, remove, clear, subtotal, currency } = useCart();

  if (!items.length) {
    return (
      <div>
        <h2>Carrito</h2>
        <div className="card p-3">
          <p>No hay items todavía — esta es una vista provisional.</p>
          <Link to="/catalog" className="btn btn-link">
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Carrito</h2>

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
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>
                  {it.imageUrl ? (
                    <img
                      src={it.imageUrl}
                      alt={it.title}
                      style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }}
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
                  </div>
                </td>
                <td className="text-center">
                  <div className="btn-group btn-group-sm" role="group">
                    <button className="btn btn-outline-secondary" onClick={() => dec(it.id)}>
                      −
                    </button>
                    <span className="btn btn-light disabled">{it.qty}</span>
                    <button className="btn btn-outline-secondary" onClick={() => inc(it.id)}>
                      +
                    </button>
                  </div>
                </td>
                <td className="text-end">
                  {it.currency} {Number(it.price).toFixed(2)}
                </td>
                <td className="text-end">
                  {it.currency} {(Number(it.price) * it.qty).toFixed(2)}
                </td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(it.id)}>
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}></td>
              <td className="text-end fw-semibold">Subtotal</td>
              <td className="text-end fw-semibold">
                {currency} {subtotal.toFixed(2)}
              </td>
              <td></td>
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
        <button className="btn btn-primary ms-auto">Confirmar compra</button>
      </div>
    </div>
  );
}
