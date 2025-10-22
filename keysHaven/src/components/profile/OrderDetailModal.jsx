import React, { useState, useEffect } from "react";
import ReviewForm from "./ReviewForm";
import ConfirmModal from "./ConfirmModal";
import * as ordersApi from "../../services/orders";
import * as reviewsApi from "../../services/reviews";

export default function OrderDetailModal({ show, order, userReviews = [], onClose, onSaveReview, onDeleteReview }) {
  const [activeItem, setActiveItem] = useState(null);
  const [editingReviewForItem, setEditingReviewForItem] = useState(null);
  const [showConfirmDeleteReview, setShowConfirmDeleteReview] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [viewMode, setViewMode] = useState(null);

  const [keysByItemId, setKeysByItemId] = useState({});
  const [loadingKeysByItemId, setLoadingKeysByItemId] = useState({});
  const [loadingReviewByItemId, setLoadingReviewByItemId] = useState({});

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

  const getOrderItemId = (item) => item?.id ?? item?.orderItemId ?? item?.order_item_id;

  const findUserReview = (orderItemId) => {
    return userReviews.find(r =>
      String(r.orderItemId) === String(orderItemId) ||
      String(r.order_item_id) === String(orderItemId)
    );
  };

  async function openKeysForItem(item) {
    setActiveItem(item);
    setEditingReviewForItem(null);
    setViewMode("keys");

    const id = getOrderItemId(item);
    if (!id) return;

    if (keysByItemId[id] || (item.digitalKeys && item.digitalKeys.length > 0)) return;

    setLoadingKeysByItemId(m => ({ ...m, [id]: true }));
    try {
      const resp = await ordersApi.getKeysByOrderItemId(id);
      const keys = Array.isArray(resp) ? resp : (resp?.items ?? resp?.content ?? resp ?? []);
      setKeysByItemId(m => ({ ...m, [id]: keys }));
    } catch (err) {
      console.error("Error cargando claves para orderItem:", id, err);
      setKeysByItemId(m => ({ ...m, [id]: [] }));
      setLoadingKeysByItemId(m => ({ ...m, [id]: false }));
    }
  }

  async function openReviewForItem(item) {
    setActiveItem(item);
    setViewMode("review");

    const id = getOrderItemId(item);
    if (!id) {
      setEditingReviewForItem(null);
      return;
    }

    const found = findUserReview(id);
    if (found) {
      setEditingReviewForItem(found);
      return;
    }

    setLoadingReviewByItemId(m => ({ ...m, [id]: true }));
    try {
      const fetched = await reviewsApi.getReviewByOrderItem(id);
      let review = null;
      if (!fetched) review = null;
      else if (Array.isArray(fetched)) review = fetched[0] ?? null;
      else review = fetched;

      setEditingReviewForItem(review ?? null);
    } catch (err) {
      console.warn("No se pudo obtener reseña por orderItem:", err);
      setEditingReviewForItem(null);
    } finally {
      setLoadingReviewByItemId(m => ({ ...m, [id]: false }));
    }
  }

  function handleCloseModal() {
    setActiveItem(null);
    setEditingReviewForItem(null);
    setViewMode(null);
    onClose && onClose();
  }

  async function handleSaveReviewLocal(data) {
    if (!activeItem) return;
    const orderItemId = getOrderItemId(activeItem);
    const existing = editingReviewForItem;
    try {
      await onSaveReview(order.id, orderItemId, data, existing ?? null);
      setActiveItem(null);
      setEditingReviewForItem(null);
      setViewMode(null);
    } catch (err) {
      console.error("Error en onSaveReview desde modal:", err);
    }
  }

  async function handleDeleteReviewLocal() {
    if (!reviewToDelete && !editingReviewForItem) return;
    const rev = reviewToDelete ?? editingReviewForItem;
    try {
      await onDeleteReview(rev.id);
      setShowConfirmDeleteReview(false);
      setReviewToDelete(null);
      setActiveItem(null);
      setEditingReviewForItem(null);
      setViewMode(null);
    } catch (err) {
      console.error("Error eliminando reseña desde modal:", err);
    }
  }

  const items = order?.items ?? order?.orderItems ?? order?.order_items ?? order?.lines ?? [];

  return (
    <div className="modal-backdrop-fixed">
      <div className="order-detail card">
        <div className="d-flex justify-content-between align-items-center">
          <h4>Orden #{order.id}</h4>
          <div>
            <button className="btn btn-outline-secondary me-2" onClick={() => { handleCloseModal(); }}>Cerrar</button>
          </div>
        </div>

        <div style = {{ color: "#e6dbff" }} className="mt-2">Creada: {order.createdAt ? new Date(order.createdAt).toLocaleString() : (order.created_at ? new Date(order.created_at).toLocaleString() : '')}</div>

        <div className="mt-3">
          <h5>Items</h5>
          {items.map(item => {
            const orderItemId = getOrderItemId(item);
            const productTitle = item.productTitle ?? item.title ?? item.product?.title ?? item.product_title ?? `#${item.productId ?? item.product?.id ?? '-'}`;
            const qty = item.quantity ?? item.qty ?? 1;
            const unitPrice = item.unitPrice ?? item.price ?? item.unit_price ?? item.lineTotal ?? item.line_total ?? '-';
            const lineTotal = item.lineTotal ?? item.line_total ?? (unitPrice !== '-' ? (Number(unitPrice) * Number(qty)) : '-');

            const foundReview = findUserReview(orderItemId);

            return (
              <div key={orderItemId ?? Math.random()} className="card p-2 mb-2">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{productTitle}</strong>
                    <div style = {{ color: "#e6dbff" }}>Cantidad: {qty} — Precio unitario: ${unitPrice}</div>
                  </div>
                  <div className="text-end">
                    <div><strong>${lineTotal}</strong></div>
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

                <div className="mt-2">
                  {userReviews && userReviews.filter(r => String(r.orderItemId) === String(orderItemId)).map(r => (
                    <div key={r.id} className="review-box card p-2">
                      <div><strong style = {{ color: "#646cff" }} >{r.title}</strong> — <span style = {{ color: "#646cff" }}>{r.rating}/10</span></div>
                      <div style = {{ color: "#646cff" }}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : (r.created_at ? new Date(r.created_at).toLocaleString() : '')}</div>
                      <div>{r.comment}</div>
                      <div className="mt-2 d-flex gap-2 justify-content-end">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => { setActiveItem(item); setEditingReviewForItem(r); setViewMode("review"); }}>Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => { setReviewToDelete(r); setShowConfirmDeleteReview(true); }}>Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>

        <div className="mt-3">
          {viewMode === "keys" && activeItem && (
            <div className="card p-3">
              <h6>Claves para: {activeItem.productTitle ?? activeItem.title ?? activeItem.product?.title}</h6>

              {loadingKeysByItemId[getOrderItemId(activeItem)] && <div className="text-muted">Cargando claves...</div>}

              <ul className="list-group">
                {(keysByItemId[getOrderItemId(activeItem)] ?? activeItem.digitalKeys ?? []).length === 0 && !loadingKeysByItemId[getOrderItemId(activeItem)] && (
                  <li className="list-group-item">No hay claves disponibles para este item.</li>
                )}

                {(keysByItemId[getOrderItemId(activeItem)] ?? activeItem.digitalKeys ?? []).map((k, i) => {
                  const code = k?.keyCode ?? k?.code ?? k?.value ?? k?.key ?? String(k);
                  return (
                    <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="small text">Clave {i+1}</div>
                        <div>{code}</div>
                      </div>
                      <div>
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => navigator.clipboard?.writeText(code)}>Copiar</button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3 d-flex gap-2 justify-content-end">
                <button className="btn btn-outline-secondary" onClick={() => { setActiveItem(null); setViewMode(null); }}>Cerrar</button>
              </div>
            </div>
          )}

          {viewMode === "review" && activeItem && (
            <div className="card p-3">
              <h6>{editingReviewForItem ? "Editar reseña" : "Dejar reseña"} — {activeItem.productTitle ?? activeItem.title ?? activeItem.product?.title}</h6>

              {loadingReviewByItemId[getOrderItemId(activeItem)] ? (
                <div className="text-muted">Cargando reseña...</div>
              ) : (
                <ReviewForm
                  initial={editingReviewForItem}
                  onSave={(data) => handleSaveReviewLocal(data)}
                  onCancel={() => { setActiveItem(null); setEditingReviewForItem(null); setViewMode(null); }}
                  onDelete={() => { setReviewToDelete(editingReviewForItem); setShowConfirmDeleteReview(true); }}
                />
              )}
            </div>
          )}
        </div>

        <ConfirmModal
          show={showConfirmDeleteReview}
          title="Eliminar reseña"
          message="¿Estás seguro de que querés eliminar esta reseña? Esta acción no se puede deshacer."
          onCancel={() => setShowConfirmDeleteReview(false)}
          onConfirm={handleDeleteReviewLocal}
          confirmText="Sí, eliminar"
        />
      </div>
    </div>
  );
}
