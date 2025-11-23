import React, { useState } from "react";
import PaginationBar from "../catalog/PaginationBar";
import OrderDetailModal from "./OrderDetailModal";

export default function OrdersTab({ ordersPage, onPageChange, userReviews, onSaveReview, onDeleteReview }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const pageNumber = Number(ordersPage?.number ?? 0);
  const totalPages = Number(ordersPage?.totalPages ?? 1);

  return (
    <div className="card p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 style={{ margin: 0 }}>Mis órdenes</h3>
        <small style={{ color: "var(--muted)" }}>{ordersPage?.totalElements ?? 0} total</small>
      </div>

      {!ordersPage?.content || (ordersPage.content.length === 0) ? (
        <div style={{ color: "#7f13ec" }}>No hay órdenes.</div>
      ) : (
        <>
          <div className="mb-2">
            {ordersPage.content.map(o => (
              <div key={o.id} className="card mb-2 p-3" style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>Orden #{o.id}</strong>
                    <div style={{ color: "#e6dbff" }}>Creada: {o.createdAt ? new Date(o.createdAt).toLocaleString() : (o.created_at ? new Date(o.created_at).toLocaleString() : "")}</div>
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

          <div className="d-flex justify-content-center mt-3">
            <PaginationBar
              page={Math.min(Math.max(1, pageNumber + 1), totalPages)}
              setPage={(p) => onPageChange && onPageChange(p)}
              totalPages={totalPages}
            />
          </div>
        </>
      )}

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
