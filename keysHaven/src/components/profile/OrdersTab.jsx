import React, { useState } from "react";
import OrderDetailModal from "./OrderDetailModal";
import ConfirmModal from "./ConfirmModal";


export default function OrdersTab({ orders, userReviews, onSaveReview, onDeleteReview }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div>
      <h3>Mis órdenes</h3>
      {orders.length === 0 && <div className="text-muted">No hay órdenes.</div>}
      <div className="mt-2">
        {orders.map(o => (
          <div key={o.id} className="card p-3 mb-2">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Orden #{o.id}</strong>
                <div style = {{ color: "#e6dbff" }}>Creada: {new Date(o.createdAt).toLocaleString()}</div>
                <div className="small">Estado: {o.status}</div>
              </div>
              <div className="text-end">
                <div><strong>${o.totalAmount}</strong></div>
                <button className="btn btn-sm btn-primary mt-2" onClick={() => setSelectedOrder(o)}>Ver detalle</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <OrderDetailModal
        show={!!selectedOrder}
        order={selectedOrder}
        userReviews={userReviews}
        onClose={() => setSelectedOrder(null)}
        onSaveReview={onSaveReview}
        onDeleteReview={onDeleteReview}
      />
    </div>
  );
}
