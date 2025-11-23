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

  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    if (!show) {
      setActiveItem(null);
      setEditingReviewForItem(null);
      setViewMode(null);
      setShowConfirmDeleteReview(false);
      setReviewToDelete(null);
      setCopiedKey(null);
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
    } finally {
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

  const normalizeLine = (item) => {
    const qty = Number(item.quantity ?? item.qty ?? 1);
    const unitPrice = Number(item.unitPrice ?? item.price ?? item.unit_price ?? 0);
    const lineSubtotal = Number(item.lineSubtotal ?? item.line?.subtotal ?? (unitPrice * qty));
    const lineTotal = Number(item.lineTotal ?? item.line?.total ?? (item.line_total ?? (lineSubtotal - (Number(item.discountAmount ?? 0)))));
    const discountAmount = Number(item.discountAmount ?? (lineSubtotal - lineTotal) ?? 0);
    return { qty, unitPrice, lineSubtotal, lineTotal, discountAmount };
  };

  const copyAndFeedback = async (text) => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.warn("Clipboard failed", err);
    }
  };

  const backdropStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    position: "fixed",
    inset: 0,
    overflowY: "auto",
    zIndex: 1400
  };

  const modalStyle = {
    width: "100%",
    maxWidth: 980,
    maxHeight: "86vh",
    overflowY: "auto",
    borderRadius: 10,
    padding: 18,
    boxSizing: "border-box"
  };

  const overlayStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    position: "fixed",
    inset: 0,
    overflowY: "auto",
    zIndex: 1600
  };

  const overlayInnerStyle = {
    width: "100%",
    maxWidth: 820,
    maxHeight: "80vh",
    borderRadius: 10,
    padding: 18,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
  };

  const overlayInnerBodyStyle = {
    flex: 1,
    overflowY: "auto",
    paddingTop: 8,
    paddingBottom: 8
  };

  const itemCardStyle = {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    flexDirection: "row",
    flex: "0 1 auto",
    flexShrink: 0,
    minWidth: 0
  };

  const itemLeftStyle = {
    flex: 1,
    minWidth: 0
  };

  const itemRightStyle = {
    flex: "0 0 auto",
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8
  };

  const reviewBoxStyle = {
    marginTop: 8,
    padding: 8,
    border: "1px dashed rgba(255,255,255,0.03)",
    background: "transparent"
  };

  const itemWrapperStyle = {
    display: "block",
    height: "auto",
    boxSizing: "border-box"
  };

  return (
    <div className="modal-backdrop-fixed" style={backdropStyle} onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }} role="presentation">
      <div className="confirm-modal card" style={modalStyle} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4 style={{ margin: 0 }}>Orden #{order.id}</h4>
          <div>
            <button className="btn btn-outline-secondary me-2" onClick={() => { handleCloseModal(); }}>Cerrar</button>
          </div>
        </div>

        <div style={{ color: "#e6dbff" }} className="mb-2">
          Creada: {order.createdAt ? new Date(order.createdAt).toLocaleString() : (order.created_at ? new Date(order.created_at).toLocaleString() : '')}
        </div>

        <div>
          <h5>Items</h5>
          {items.map(item => {
            const orderItemId = getOrderItemId(item);
            const productTitle = item.productTitle ?? item.title ?? item.product?.title ?? item.product_title ?? `#${item.productId ?? item.product?.id ?? '-'}`;
            const { qty, unitPrice, lineSubtotal, lineTotal, discountAmount } = normalizeLine(item);
            const foundReview = findUserReview(orderItemId);

            return (
              <div
                key={orderItemId ?? Math.random()}
                className="card p-2 mb-2"
                style={{ border: "1px solid rgba(255,255,255,0.03)", ...itemWrapperStyle }}
              >
                <div style={itemCardStyle}>
                  <div style={itemLeftStyle}>
                    <strong style={{ color: "#e6dbff" }}>{productTitle}</strong>
                    <div style={{ color: "#e6dbff" }}>Cantidad: {qty}</div>
                    <div className="small">Precio unitario: ${Number(unitPrice).toFixed(2)}</div>
                    {Number(discountAmount) > 0 && (
                      <div className="small text-danger">Descuento en este ítem: −${Number(discountAmount).toFixed(2)}</div>
                    )}

                    <div>
                      {userReviews && userReviews.filter(r => String(r.orderItemId) === String(orderItemId)).map(r => (
                        <div key={r.id} className="review-box" style={reviewBoxStyle}>
                          <div><strong style={{ color: "#7f13ec" }}>{r.title}</strong> — <span style={{ color: "#7f13ec" }}>{r.rating}/10</span></div>
                          <div style={{ color: "#7f13ec" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : (r.created_at ? new Date(r.created_at).toLocaleDateString() : '')}</div>
                          <div style={{ color: "#e6dbff" }}>{r.comment}</div>
                          <div className="mt-2 d-flex gap-2 justify-content-end">
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => { setActiveItem(item); setEditingReviewForItem(r); setViewMode("review"); }}>Editar</button>
                            <button className="btn btn-sm btn-danger" onClick={() => { setReviewToDelete(r); setShowConfirmDeleteReview(true); }}>Eliminar</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={itemRightStyle}>
                    <div><strong>${Number(lineTotal).toFixed(2)}</strong></div>
                    <div style={{ marginTop: 8 }}>
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openKeysForItem(item)}>Ver claves</button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => openReviewForItem(item)}>Reseña</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {viewMode === "keys" && activeItem && (
          <div className="modal-backdrop-fixed" style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) setViewMode(null); }} role="presentation">
            <div className="confirm-modal card" style={overlayInnerStyle} onClick={(e) => e.stopPropagation()}>
              <div>
                <h6 style={{ marginTop: 0 }}>Claves para: {activeItem.productTitle ?? activeItem.title ?? activeItem.product?.title}</h6>
              </div>


              <div style={overlayInnerBodyStyle}>
                {loadingKeysByItemId[getOrderItemId(activeItem)] && <div className="text-muted">Cargando claves...</div>}

                <ul className="list-group" style={{ marginTop: 8 }}>
                  {(keysByItemId[getOrderItemId(activeItem)] ?? activeItem.digitalKeys ?? []).length === 0 && !loadingKeysByItemId[getOrderItemId(activeItem)] && (
                    <li className="list-group-item">No hay claves disponibles para este item.</li>
                  )}

                  {(keysByItemId[getOrderItemId(activeItem)] ?? activeItem.digitalKeys ?? []).map((k, i) => {
                    const code = k?.keyCode ?? k?.code ?? k?.value ?? k?.key ?? String(k);
                    const isCopied = copiedKey === code;
                    return (
                      <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <div className="small text">Clave {i+1}</div>
                          <div style={{ fontFamily: "monospace", color: "#e6dbff" }}>{code}</div>
                        </div>
                        <div>
                          <button className={`btn btn-sm btn-outline-secondary me-2 ${isCopied ? "active" : ""}`} onClick={() => copyAndFeedback(code)}>
                            {isCopied ? "Copiado ✓" : "Copiar"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-3 d-flex gap-2 justify-content-end" style={{ marginTop: 8 }}>
                <button className="btn btn-outline-secondary" onClick={() => { setActiveItem(null); setViewMode(null); }}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {viewMode === "review" && activeItem && (
          <div className="modal-backdrop-fixed" style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) setViewMode(null); }} role="presentation">
            <div className="confirm-modal card" style={overlayInnerStyle} onClick={(e) => e.stopPropagation()}>
              <div>
                <h6 style={{ marginTop: 0 }}>{editingReviewForItem ? "Editar reseña" : "Dejar reseña"} — {activeItem.productTitle ?? activeItem.title ?? activeItem.product?.title}</h6>
              </div>

              <div style={overlayInnerBodyStyle}>
                {loadingReviewByItemId[getOrderItemId(activeItem)] ? (
                  <div className="text-muted">Cargando reseña...</div>
                ) : (
                  <div style={{ minWidth: 0 }}>
                    <ReviewForm
                      initial={editingReviewForItem}
                      onSave={(data) => handleSaveReviewLocal(data)}
                      onCancel={() => { setActiveItem(null); setEditingReviewForItem(null); setViewMode(null); }}
                      onDelete={() => { setReviewToDelete(editingReviewForItem); setShowConfirmDeleteReview(true); }}
                    />
                  </div>
                )}
              </div>

              <div style={{ height: 8 }} />
            </div>
          </div>
        )}

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
