import React, { useEffect, useState } from 'react';
import { getReviewsPage, toggleReviewVisibility, getProductsPage, getUsersPage } from '../../services/adminService';
import ConfirmModal from '../profile/ConfirmModal';
import PaginationBar from '../catalog/PaginationBar';

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [confirm, setConfirm] = useState({ show:false, title:'', message:'', onConfirm:null });

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(()=>{ load(); }, [page]);

  const load = async () => {
    setLoading(true);
    try {
      const [rvwsResp, prodsResp, usersResp] = await Promise.all([
        getReviewsPage(page, pageSize),
        getProductsPage(1, 100),
        getUsersPage(1, 200)
      ]);

      const rvws = (rvwsResp && rvwsResp.content && Array.isArray(rvwsResp.content)) ? rvwsResp.content : (Array.isArray(rvwsResp) ? rvwsResp : []);
      setReviews(rvws);
      setTotalPages(rvwsResp?.totalPages ?? 1);

      const prods = (prodsResp && prodsResp.content) ? prodsResp.content : (Array.isArray(prodsResp) ? prodsResp : []);
      const us = (usersResp && usersResp.content) ? usersResp.content : (Array.isArray(usersResp) ? usersResp : []);

      setProductsMap(Object.fromEntries((prods || []).map(p => [p.id, p])));
      setUsersMap(Object.fromEntries((us || []).map(u => [u.id, u])));
    } catch (err) {
      console.error(err);
      setError('Error cargando reseñas');
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      await toggleReviewVisibility(reviewId, false);
      await load();
    } catch (err) {
      console.error(err);
      setError('Error ocultando reseña');
    } finally {
      setLoading(false);
      closeConfirm();
    }
  };

  const handleShow = async (reviewId) => {
    setLoading(true);
    try {
      await toggleReviewVisibility(reviewId, true);
      await load();
    } catch (err) {
      console.error(err);
      setError('Error mostrando reseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
        <h5 className="text-primary-light mb-0">Gestión de Reseñas</h5>
        <button className="btn btn-outline-secondary" onClick={load} disabled={loading}>Refrescar</button>
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
              {loading ? (
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
                      <button className="btn btn-outline-secondary" onClick={()=>handleToggleRequest(r.id, r.visible)} disabled={loading}>
                        {r.visible ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && reviews.length === 0 && <div className="text-center text-muted py-4">No hay reseñas</div>}
        </div>

        <div className="d-flex justify-content-center mt-3">
          <PaginationBar page={page} setPage={setPage} totalPages={Math.max(1, totalPages)} />
        </div>

        <ConfirmModal
          show={confirm.show}
          title={confirm.title}
          message={confirm.message}
          onConfirm={() => { confirm.onConfirm && confirm.onConfirm(); }}
          onCancel={closeConfirm}
          confirmText="Confirmar"
          cancelText="Cancelar"
        />
      </div>
    </div>
  );
}
