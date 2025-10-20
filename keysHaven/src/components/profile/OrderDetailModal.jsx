import React, { useState, useEffect } from "react";
import ReviewForm from "./ReviewForm";
import ConfirmModal from "./ConfirmModal";

export default function OrderDetailModal({ show, order, userReviews, onClose, onSaveReview, onDeleteReview }) {
  const [activeItem, setActiveItem] = useState(null);
  const [editingReviewForItem, setEditingReviewForItem] = useState(null);
  const [showConfirmDeleteReview, setShowConfirmDeleteReview] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [viewMode, setViewMode] = useState(null);


  useEffect(() => {
    if (!show) {
      setActiveItem(null);
      setEditingReviewForItem(null);
      setViewMode(null);
      setShowConfirmDeleteReview(false);
      setReviewToDelete(null);
    }
  }, [show, order]);

  if (!show || !order) return null;

  function openKeysForItem(item) {
    setActiveItem(item);
    setEditingReviewForItem(null);
    setViewMode("keys");
  }

  function openReviewForItem(item) {
    setActiveItem(item);
    const existing = userReviews.find(r => r.orderItemId === item.id);
    setEditingReviewForItem(existing ?? null);
    setViewMode("review");
  }

  function handleSaveReview(data) {
    if (!activeItem) return;
    onSaveReview(order.id, activeItem.id, data, editingReviewForItem);

    setActiveItem(null);
    setEditingReviewForItem(null);
    setViewMode(null);
  }

  function handleDeleteReview() {
    if (!reviewToDelete) return;
    onDeleteReview(reviewToDelete.id);
    setShowConfirmDeleteReview(false);
    setReviewToDelete(null);
    setActiveItem(null);
    setEditingReviewForItem(null);
    setViewMode(null);
  }

  return (
    <div className="modal-backdrop-fixed">
      <div className="order-detail card">
        <div className="d-flex justify-content-between align-items-center">
          <h4>Orden #{order.id}</h4>
          <div>
            <button className="btn btn-outline-secondary me-2" onClick={() => {

              setActiveItem(null);
              setViewMode(null);
              onClose();
            }}>Cerrar</button>
          </div>
        </div>

        <div style = {{ color: "#e6dbff" }} className="mt-2">Creada: {new Date(order.createdAt).toLocaleString()}</div>
        <div className="mt-3">
          <h5>Items</h5>
          {order.items.map(item => (
            <div key={item.id} className="card p-2 mb-2">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{item.productTitle}</strong>
                  <div style = {{ color: "#e6dbff" }}>Cantidad: {item.quantity} — Precio unitario: ${item.unitPrice}</div>
                </div>
                <div className="text-end">
                  <div><strong>${item.lineTotal}</strong></div>
                  <div style={{ marginTop: 8 }}>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openKeysForItem(item)}>
                      Ver claves
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => openReviewForItem(item)}>
                      Reseña
                    </button>
                  </div>
                </div>
              </div>

              {}
              <div className="mt-2">
                {userReviews.filter(r => r.orderItemId === item.id).map(r => (
                  <div key={r.id} className="review-box card p-2">
                    <div><strong style = {{ color: "#646cff" }} >{r.title}</strong> — <span style = {{ color: "#646cff" }}>{r.rating}/10</span></div>
                    <div style = {{ color: "#646cff" }}>{new Date(r.createdAt).toLocaleString()}</div>
                    <div>{r.comment}</div>
                    <div className="mt-2 d-flex gap-2 justify-content-end">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => {

                        setActiveItem(item);
                        setEditingReviewForItem(r);
                        setViewMode("review");
                      }}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => { setReviewToDelete(r); setShowConfirmDeleteReview(true); }}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {}
        <div className="mt-3">
          {viewMode === "keys" && activeItem && (
            <div className="card p-3">
              <h6>Claves para: {activeItem.productTitle}</h6>
              <ul className="list-group">
                {activeItem.digitalKeys.map((k, i) => (
                  <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div style = {{ color: "#646cff" }}className="small text">Clave {i+1}</div>
                      <div>{k.keyCode}</div>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => navigator.clipboard?.writeText(k.keyCode)}>Copiar</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 d-flex gap-2 justify-content-end">
                <button className="btn btn-outline-secondary" onClick={() => { setActiveItem(null); setViewMode(null); }}>Cerrar</button>
              </div>
            </div>
          )}

          {viewMode === "review" && activeItem && (
            <div className="card p-3">
              <h6>{editingReviewForItem ? "Editar reseña" : "Dejar reseña"} — {activeItem.productTitle}</h6>
              <ReviewForm
                initial={editingReviewForItem}
                onSave={(data) => handleSaveReview(data)}
                onCancel={() => { setActiveItem(null); setEditingReviewForItem(null); setViewMode(null); }}
                onDelete={() => { setReviewToDelete(editingReviewForItem); setShowConfirmDeleteReview(true); }}
              />
            </div>
          )}
        </div>

        <ConfirmModal
          show={showConfirmDeleteReview}
          title="Eliminar reseña"
          message="¿Estás seguro de que querés eliminar esta reseña? Esta acción no se puede deshacer."
          onCancel={() => setShowConfirmDeleteReview(false)}
          onConfirm={handleDeleteReview}
          confirmText="Sí, eliminar"
        />
      </div>
    </div>
  );
}
