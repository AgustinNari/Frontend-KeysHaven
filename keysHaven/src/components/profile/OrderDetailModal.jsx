import React, { useState, useEffect } from "react";
import ReviewForm from "./ReviewForm";
import ConfirmModal from "./ConfirmModal";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { getKeysByOrderItemId } from "../../redux/slices/ordersSlice";
import { fetchReviewByOrderItem, createReview, updateReview, deleteReview } from "../../redux/slices/reviewsSlice";

export default function OrderDetailModal({ show, order, onClose, onSaveReview, onDeleteReview }) {
  const dispatch = useAppDispatch();

  const reviewByOrderItem = useAppSelector(state => state.reviews.reviewByOrderItem ?? {});
  const keysByOrderItemStore = useAppSelector(state => state.orders.keysByOrderItem ?? {});

  const [activeItem, setActiveItem] = useState(null);
  const [editingReviewForItem, setEditingReviewForItem] = useState(null);
  const [showConfirmDeleteReview, setShowConfirmDeleteReview] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [viewMode, setViewMode] = useState(null);

  const [loadingKeysByItemId, setLoadingKeysByItemId] = useState({});
  const [loadingReviewByItemId, setLoadingReviewByItemId] = useState({});

  const [copiedKey, setCopiedKey] = useState(null);

  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    if (!show) {
      setActiveItem(null);
      setEditingReviewForItem(null);
      setViewMode(null);
      setShowConfirmDeleteReview(false);
      setReviewToDelete(null);
      setCopiedKey(null);
      setReviewError(null);
    }
  }, [show, order]);

  if (!show || !order) return null;

  const getOrderItemId = (item) => {
    const maybe = item?.id ?? item?.orderItemId ?? item?.order_item_id;
    if (maybe == null) return null;
    const n = Number(maybe);
    return Number.isNaN(n) ? maybe : n;
  };

  async function openKeysForItem(item) {
    setActiveItem(item);
    setEditingReviewForItem(null);
    setViewMode("keys");
    setReviewError(null);

    const id = getOrderItemId(item);
    if (!id) return;


    if (keysByOrderItemStore && Object.prototype.hasOwnProperty.call(keysByOrderItemStore, String(id))) {

      return;
    }

    setLoadingKeysByItemId(m => ({ ...m, [id]: true }));
    try {
      await dispatch(getKeysByOrderItemId(id)).unwrap();

    } catch (err) {
      console.error("Error cargando claves para orderItem:", id, err);
    } finally {
      setLoadingKeysByItemId(m => ({ ...m, [id]: false }));
    }
  }

  async function openReviewForItem(item) {
    setActiveItem(item);
    setViewMode("review");
    setReviewError(null);

    const id = getOrderItemId(item);
    if (!id) {
      setEditingReviewForItem(null);
      return;
    }

    const key = String(id);
    if (Object.prototype.hasOwnProperty.call(reviewByOrderItem, key)) {
      setEditingReviewForItem(reviewByOrderItem[key] ?? null);
      return;
    }

    setLoadingReviewByItemId(m => ({ ...m, [id]: true }));
    try {
      const { resp } = await dispatch(fetchReviewByOrderItem(id)).unwrap();
      let review = null;
      if (!resp) review = null;
      else if (Array.isArray(resp)) review = resp[0] ?? null;
      else review = resp;
      setEditingReviewForItem(review ?? null);
    } catch (err) {
      console.warn("No se pudo obtener reseña por orderItem:", err?.message ?? err);
      setEditingReviewForItem(null);
    } finally {
      setLoadingReviewByItemId(m => ({ ...m, [id]: false }));
    }
  }

  const getKeysForItem = (item) => {
    const id = getOrderItemId(item);
    if (id != null && keysByOrderItemStore && keysByOrderItemStore[String(id)]) {
      return keysByOrderItemStore[String(id)];
    }
    return item.digitalKeys ?? [];
  };

  async function handleSaveReviewLocal(data) {
    if (!activeItem) return;
    const orderItemId = getOrderItemId(activeItem);
    const existing = editingReviewForItem;
    let succeeded = false;
    setReviewError(null);
    try {
      if (existing && (existing.id || existing.reviewId || existing._id)) {
        const rid = existing.id ?? existing.reviewId ?? existing._id;
        if (rid == null) {
          const productId = data.productId ?? activeItem.productId ?? activeItem.product?.id ?? null;
          const payload = { productId, rating: data.rating, title: data.title, comment: data.comment, orderItemId };
          await dispatch(createReview(payload)).unwrap();
        } else {
          const dto = { rating: data.rating, title: data.title, comment: data.comment };
          await dispatch(updateReview({ reviewId: rid, dto })).unwrap();
        }
      } else {
        const productId = data.productId ?? activeItem.productId ?? activeItem.product?.id ?? null;
        const payload = { productId, rating: data.rating, title: data.title, comment: data.comment, orderItemId };
        await dispatch(createReview(payload)).unwrap();
      }

      try {
        await dispatch(fetchReviewByOrderItem(orderItemId)).unwrap();
      } catch (e) {
      }

      const key = String(orderItemId);
      const updated = (reviewByOrderItem && reviewByOrderItem[key]) ? reviewByOrderItem[key] : null;
      setEditingReviewForItem(updated ?? null);
      onSaveReview && onSaveReview(order?.id, orderItemId, data, existing ?? null);
      succeeded = true;
      setActiveItem(null);
      setEditingReviewForItem(null);
      setViewMode(null);
      setReviewError(null);
    } catch (err) {
      const msg = err?.message ?? String(err) ?? "Error guardando reseña.";
      console.error("Error en onSaveReview desde modal:", msg);
      setReviewError(msg);
    }
    return succeeded;
  }

  async function handleDeleteReviewLocal() {
    const rev = reviewToDelete ?? editingReviewForItem;
    if (!rev) return;

    const possibleId = rev?.id ?? rev?.reviewId ?? rev?._id ?? null;
    let idToDelete = possibleId;
    const orderItemId = getOrderItemId(activeItem);

    if (!idToDelete && orderItemId != null) {
      const stored = reviewByOrderItem[String(orderItemId)];
      idToDelete = stored?.id ?? stored?.reviewId ?? stored?._id ?? null;
    }

    if (!idToDelete) {
      console.warn("No se encontró id de reseña para eliminar.");
      setShowConfirmDeleteReview(false);
      setReviewToDelete(null);
      return;
    }

    setReviewError(null);
    try {
      await dispatch(deleteReview(idToDelete)).unwrap();
      if (orderItemId != null) {
        try { await dispatch(fetchReviewByOrderItem(orderItemId)).unwrap(); } catch (e) {}
      }
      onDeleteReview && onDeleteReview(idToDelete);
      setShowConfirmDeleteReview(false);
      setReviewToDelete(null);
      setActiveItem(null);
      setEditingReviewForItem(null);
      setViewMode(null);
      setReviewError(null);
    } catch (err) {
      const msg = err?.message ?? String(err) ?? "Error eliminando reseña.";
      console.error("Error eliminando reseña desde modal:", msg);
      setReviewError(msg);
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

  const backdropStyle = { display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "fixed", inset: 0, overflowY: "auto", zIndex: 1400 };
  const modalStyle = { width: "100%", maxWidth: 980, maxHeight: "86vh", overflowY: "auto", borderRadius: 10, padding: 18, boxSizing: "border-box" };
  const overlayStyle = { display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "fixed", inset: 0, overflowY: "auto", zIndex: 1600 };
  const overlayInnerStyle = { width: "100%", maxWidth: 820, maxHeight: "80vh", borderRadius: 10, padding: 18, boxSizing: "border-box", display: "flex", flexDirection: "column" };
  const overlayInnerBodyStyle = { flex: 1, overflowY: "auto", paddingTop: 8, paddingBottom: 8 };
  const itemCardStyle = { display: "flex", gap: 12, alignItems: "flex-start", flexDirection: "row", flex: "0 1 auto", flexShrink: 0, minWidth: 0 };
  const itemLeftStyle = { flex: 1, minWidth: 0 };
  const itemRightStyle = { flex: "0 0 auto", textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 };
  const reviewBoxStyle = { marginTop: 8, padding: 8, border: "1px dashed rgba(255,255,255,0.03)", background: "transparent" };
  const itemWrapperStyle = { display: "block", height: "auto", boxSizing: "border-box" };

  return (
    <div className="modal-backdrop-fixed" style={backdropStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }} role="presentation">
      <div className="confirm-modal card" style={modalStyle} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4 style={{ margin: 0 }}>Orden #{order.id}</h4>
          <div>
            <button className="btn btn-outline-secondary me-2" onClick={() => { onClose && onClose(); }}>Cerrar</button>
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

            const reviewFromStore = orderItemId != null ? reviewByOrderItem[String(orderItemId)] : null;
            const keysForThis = getKeysForItem(item);

            return (
              <div key={orderItemId ?? Math.random()} className="card p-2 mb-2" style={{ border: "1px solid rgba(255,255,255,0.03)", ...itemWrapperStyle }}>
                <div style={itemCardStyle}>
                  <div style={itemLeftStyle}>
                    <strong style={{ color: "#e6dbff" }}>{productTitle}</strong>
                    <div style={{ color: "#e6dbff" }}>Cantidad: {qty}</div>
                    <div className="small">Precio unitario: ${Number(unitPrice).toFixed(2)}</div>
                    {Number(discountAmount) > 0 && (<div className="small text-danger">Descuento en este ítem: −${Number(discountAmount).toFixed(2)}</div>)}

                    <div>
                      {reviewFromStore && (
                        <div className="review-box" style={reviewBoxStyle}>
                          <div><strong style={{ color: "#7f13ec" }}>{reviewFromStore.title}</strong> — <span style={{ color: "#7f13ec" }}>{reviewFromStore.rating}/10</span></div>
                          <div style={{ color: "#7f13ec" }}>{reviewFromStore.createdAt ? new Date(reviewFromStore.createdAt).toLocaleDateString() : (reviewFromStore.created_at ? new Date(reviewFromStore.created_at).toLocaleDateString() : '')}</div>
                          <div style={{ color: "#e6dbff" }}>{reviewFromStore.comment}</div>
                          <div className="mt-2 d-flex gap-2 justify-content-end">
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => { setActiveItem(item); setEditingReviewForItem(reviewFromStore); setViewMode("review"); }}>Editar</button>
                            <button className="btn btn-sm btn-danger" onClick={() => { setReviewToDelete(reviewFromStore); setShowConfirmDeleteReview(true); }}>Eliminar</button>
                          </div>
                        </div>
                      )}
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
                  {(getKeysForItem(activeItem) ?? []).length === 0 && !loadingKeysByItemId[getOrderItemId(activeItem)] && (
                    <li className="list-group-item">No hay claves disponibles para este item.</li>
                  )}

                  {(getKeysForItem(activeItem) ?? []).map((k, i) => {
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
                    {reviewError && (
                      <div className="alert alert-danger" style={{ marginBottom: 12 }}>
                        {reviewError}
                      </div>
                    )}

                    <ReviewForm
                      initial={editingReviewForItem}
                      onSave={(data) => handleSaveReviewLocal(data)}
                      onCancel={() => { setActiveItem(null); setEditingReviewForItem(null); setViewMode(null); setReviewError(null); }}
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
