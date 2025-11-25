import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmModal from '../profile/ConfirmModal';
import PaginationBar from '../catalog/PaginationBar';

import { fetchReviewsPage, adminToggleReviewVisibility } from '../../redux/slices/adminPanelSlice';
import { fetchProductsPage } from '../../redux/slices/adminPanelSlice';
import { fetchLatestReviews, fetchReviewsByProduct } from '../../redux/slices/reviewsSlice';
import { fetchProductDetail } from '../../redux/slices/productDetailSlice';
import { fetchSellerDetail } from '../../redux/slices/sellersSlice';
import { selectAdminPanel } from '../../redux/slices/adminPanelSlice';

export default function ReviewsManagement() {
  const dispatch = useDispatch();
  const admin = useSelector(selectAdminPanel);
  const reviewsPage = admin?.reviewsPage ?? null;
  const reviews = reviewsPage?.content ?? [];

  const [productsMap, setProductsMap] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [error, setError] = useState('');

  const [confirm, setConfirm] = useState({ show:false, title:'', message:'', onConfirm:null });

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, reviewsPage?.totalPages ?? 1);

  useEffect(()=>{ load();}, [page]);

  const load = async () => {
    setLoadingLocal(true);
    try {
      const [rvwsResp] = await Promise.all([
        dispatch(fetchReviewsPage({ page, size: pageSize })).unwrap()
      ]);
      const prodsResp = await dispatch(fetchProductsPage({ page: 1, size: 200 })).unwrap().catch(()=>null);
      const usersResp = await dispatch(fetchProductsPage({ page: 1, size: 200 })).unwrap().catch(()=>null);

      const prods = prodsResp?.content ?? prodsResp ?? [];
      const us = usersResp?.content ?? usersResp ?? [];

      setProductsMap(Object.fromEntries((prods || []).map(p => [p.id, p])));
      setUsersMap(Object.fromEntries((us || []).map(u => [u.id, u])));
    } catch (err) {
      console.error(err);
      setError('Error cargando reseñas');
    } finally {
      setLoadingLocal(false);
    }
  };

  const closeConfirm = () => setConfirm({ show:false, title:'', message:'', onConfirm:null });

  const handleToggleRequest = (reviewId, visible) => {
    if (visible) {
      setConfirm({
        show: true,
        title: 'Ocultar Reseña',
        message: '¿Estás seguro que querés ocultar esta reseña? Podrás mostrarla luego si cambias de opinión.',
        onConfirm: () => handleHideConfirmed(reviewId)
      });
    } else {
      handleShow(reviewId);
    }
  };

  const handleHideConfirmed = async (reviewId) => {
    setLoadingLocal(true);
    try {
      const payload = await dispatch(adminToggleReviewVisibility({ reviewId, visible: false })).unwrap();
      await dispatch(fetchReviewsPage({ page, size: pageSize })).unwrap();
      dispatch(fetchLatestReviews()).catch(()=>{});
      const prodId = payload?.resp?.productId ?? payload?.resp?.product?.id ?? payload?.resp?.productId;
      const sellerId = payload?.resp?.sellerId ?? payload?.resp?.seller?.id;
      if (prodId) {
        dispatch(fetchReviewsByProduct({ productId: prodId, page: 0, size: 20 })).catch(()=>{});
        dispatch(fetchProductDetail(prodId)).catch(()=>{});
      }
      if (sellerId) {
        dispatch(fetchSellerDetail(sellerId)).catch(()=>{});
      }
    } catch (err) {
      console.error(err);
      setError('Error ocultando reseña');
    } finally {
      setLoadingLocal(false);
      closeConfirm();
    }
  };

  const handleShow = async (reviewId) => {
    setLoadingLocal(true);
    try {
      const payload = await dispatch(adminToggleReviewVisibility({ reviewId, visible: true })).unwrap();
      await dispatch(fetchReviewsPage({ page, size: pageSize })).unwrap();
      dispatch(fetchLatestReviews()).catch(()=>{});
      const prodId = payload?.resp?.productId ?? payload?.resp?.product?.id ?? payload?.resp?.productId;
      const sellerId = payload?.resp?.sellerId ?? payload?.resp?.seller?.id;
      if (prodId) {
        dispatch(fetchReviewsByProduct({ productId: prodId, page: 0, size: 20 })).catch(()=>{});
        dispatch(fetchProductDetail(prodId)).catch(()=>{});
      }
      if (sellerId) {
        dispatch(fetchSellerDetail(sellerId)).catch(()=>{});
      }
    } catch (err) {
      console.error(err);
      setError('Error mostrando reseña');
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
        <h5 className="text-primary-light mb-0">Gestión de Reseñas</h5>
        <button className="btn btn-outline-secondary" onClick={load} disabled={loadingLocal}>Refrescar</button>
      </div>

      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="table table-dark table-borderless">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Comprador</th>
                <th>Rating</th>
                <th>Título</th>
                <th>Comentario</th>
                <th>Visible</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loadingLocal ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">Cargando reseñas...</td></tr>
              ) : reviews.map(r => (
                <tr key={r.id}>
                  <td>{productsMap[r.productId]?.title || `#${r.productId}`}</td>
                  <td>{usersMap[r.buyerId]?.displayName || usersMap[r.buyerId]?.email || `#${r.buyerId}`}</td>
                  <td>{r.rating}</td>
                  <td>{r.title}</td>
                  <td style={{maxWidth: 300}}><small className="text-muted">{r.comment}</small></td>
                  <td><span className={`badge ${r.visible ? 'bg-success' : 'bg-danger'}`}>{r.visible ? 'Visible' : 'Oculta'}</span></td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-secondary" onClick={()=>handleToggleRequest(r.id, r.visible)} disabled={loadingLocal}>
                        {r.visible ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loadingLocal && reviews.length === 0 && <div className="text-center text-muted py-4">No hay reseñas</div>}
        </div>

        <div className="d-flex justify-content-center mt-3">
          <PaginationBar page={page} setPage={setPage} totalPages={totalPages} />
        </div>

        <ConfirmModal show={confirm.show} title={confirm.title} message={confirm.message} onConfirm={() => { confirm.onConfirm && confirm.onConfirm(); }} onCancel={closeConfirm} confirmText="Ocultar" cancelText="Cancelar" />
      </div>
    </div>
  );
}
