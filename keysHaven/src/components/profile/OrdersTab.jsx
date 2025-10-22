import React, { useState } from "react";
import OrderDetailModal from "./OrderDetailModal";
import ConfirmModal from "./ConfirmModal";

export default function OrdersTab({ orders, userReviews, onSaveReview, onDeleteReview }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div>
      <h3>Mis órdenes</h3>
      {(!orders || orders.length === 0) && <div style={{color : "#7f13ec"}}>No hay órdenes.</div>}
      <div className="mt-2">
        {orders.map(o => (
          <div key={o.id} className="card p-3 mb-2">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Orden #{o.id}</strong>
                <div style = {{ color: "#e6dbff" }}>Creada: {o.createdAt ? new Date(o.createdAt).toLocaleString() : (o.created_at ? new Date(o.created_at).toLocaleString() : "")}</div>
                <div className="small">Estado: {o.status}</div>
              </div>
              <div className="text-end">
                <div><strong>${o.totalAmount ?? o.total ?? '-'}</strong></div>
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
