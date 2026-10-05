import React, { useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { fetchSellerStats, fetchSellerOrders } from '../../redux/slices/sellerPanelSlice';
import PaginationBar from '../catalog/PaginationBar';

function makePageKey({ sellerId, page = 0, size = 10, status }) {
  return `${sellerId ?? 'anon'}_${page}_${size}_${status ?? 'all'}`;
}

const emptyOrders = [];
const emptyStats = { totalSales: 0, totalRevenue: 0, activeProducts: 0, totalProducts: 0, avgRating: 0, pendingOrders: 0 };

export default function SalesAnalytics({ sellerId: suppliedSellerId }) {
  const sellerId = useAppSelector(state => suppliedSellerId ?? state.auth.user?.id);
  const dispatch = useAppDispatch();

  const stats = useAppSelector(state => state.sellerPanel.stats) ?? emptyStats;
  const ordersState = useAppSelector(state => state.sellerPanel.orders) ?? { items: [], total: 0 };
  const ordersPages = useAppSelector(state => state.sellerPanel.ordersPages);
  const loading = useAppSelector(state => state.sellerPanel.loading);

  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const [sortBy, setSortBy] = React.useState('date_desc');

  useEffect(() => {
    if (!sellerId) return;

    dispatch(fetchSellerStats({ sellerId }));

  }, [sellerId, dispatch]);

  useEffect(() => {
    if (!sellerId) return;

    const zeroBased = Math.max(0, page - 1);
    const key = makePageKey({ sellerId, page: zeroBased, size: pageSize, status: 'COMPLETED' });
    const cachedPage = ordersPages[key];

    if (!cachedPage) {

      dispatch(fetchSellerOrders({ sellerId, page: zeroBased, size: pageSize, status: 'COMPLETED' })).catch(() => { /* The view reports errors through Redux. */ });
    }

  }, [sellerId, page, dispatch, ordersPages]);


  const zeroBased = Math.max(0, page - 1);
  const currentKey = makePageKey({ sellerId, page: zeroBased, size: pageSize, status: 'COMPLETED' });
  const currentPageResp = ordersPages[currentKey] ?? ordersState;
  const recentOrders = currentPageResp.items ?? emptyOrders;
  const totalOrders = currentPageResp.total ?? (recentOrders.length);

  const computeOrderAmount = (order) => {
    if (!order || !Array.isArray(order.items)) return 0;
    return order.items.reduce((acc, it) => {
      const v = parseFloat(it?.lineTotal ?? it?.lineSubtotal ?? (it?.unitPrice * (it?.quantity ?? 1))) || 0;
      return acc + v;
    }, 0);
  };

  const sortedOrders = useMemo(() => {
    const arr = (recentOrders || []).slice();
    if (sortBy === 'date_desc') {
      arr.sort((a, b) => new Date(b.createdAt || b.completedAt || 0).getTime() - new Date(a.createdAt || a.completedAt || 0).getTime());
    } else if (sortBy === 'date_asc') {
      arr.sort((a, b) => new Date(a.createdAt || a.completedAt || 0).getTime() - new Date(b.createdAt || b.completedAt || 0).getTime());
    } else if (sortBy === 'amount_desc') {
      arr.sort((a, b) => computeOrderAmount(b) - computeOrderAmount(a));
    } else if (sortBy === 'amount_asc') {
      arr.sort((a, b) => computeOrderAmount(a) - computeOrderAmount(b));
    }
    return arr;
  }, [recentOrders, sortBy]);

  if (loading) {
    return (
      <div className="text-center text-muted py-5">
        <div className="spinner-border" role="status"></div>
        <div className="mt-2">Cargando datos del dashboard...</div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil((totalOrders || 0) / pageSize));

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-body py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="text-primary-light mb-0">Resumen de Ventas</h6>
              <div>
                <small className="text-muted me-2">Ordenar órdenes de página por:</small>
                <select className="form-select form-select-sm d-inline-block w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="date_desc">Fecha (más recientes)</option>
                  <option value="date_asc">Fecha (más antiguas)</option>
                  <option value="amount_desc">Monto (mayor)</option>
                  <option value="amount_asc">Monto (menor)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2"><i className="fas fa-shopping-cart fa-2x"></i></div>
            <h3 className="text-primary-light">{stats.totalSales}</h3>
            <p className="text-muted mb-0">Ventas Totales</p>
          </div>
        </div>
      </div>

      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2"><i className="fas fa-dollar-sign fa-2x"></i></div>
            <h3 className="text-primary-light">${(Number(stats.totalRevenue || 0)).toLocaleString()}</h3>
            <p className="text-muted mb-0">Ingresos Totales</p>
          </div>
        </div>
      </div>

      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2"><i className="fas fa-box fa-2x"></i></div>
            <h3 className="text-primary-light">{stats.activeProducts}/{stats.totalProducts}</h3>
            <p className="text-muted mb-0">Productos Activos</p>
          </div>
        </div>
      </div>

      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2"><i className="fas fa-star fa-2x"></i></div>
            <h3 className="text-primary-light">{(stats.avgRating/2 || 0).toFixed(1)}/5</h3>
            <p className="text-muted mb-0">Rating Promedio</p>
          </div>
        </div>
      </div>

      <div className="col-12 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
            <h6 className="text-primary-light mb-0">Tus Ventas</h6>
            <div className="text-muted small">Mostrando página {page} de {totalPages} — {totalOrders} órdenes</div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-dark table-borderless mb-0">
                <thead>
                  <tr>
                    <th>Orden ID</th>
                    <th>Cliente</th>
                    <th>Productos</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map(order => {
                    const amount = computeOrderAmount(order);
                    const productsList = (order.items || []).map(it => `${it.productTitle || it.productName || '—'} x${it.quantity ?? 1}`).join(', ');
                    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order.completedAt ? new Date(order.completedAt).toLocaleDateString() : '-');
                    return (
                      <tr key={order.id}>
                        <td className="text-muted">#{order.id}</td>
                        <td className="text-primary-light">{order.buyerDisplayName ?? order.buyerId ?? order.customerName ?? order.customer ?? '-'}</td>
                        <td style={{ maxWidth: 420, whiteSpace: 'normal' }}>{productsList || '-'}</td>
                        <td>${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="text-muted">{dateStr}</td>
                        <td>
                          <span className={`badge ${order.status === 'COMPLETED' ? 'bg-success' : order.status === 'PENDING' ? 'bg-warning' : 'bg-secondary'}`}>
                            {order.status ?? '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {sortedOrders.length === 0 && <div className="text-center text-muted py-3">No hay órdenes recientes</div>}
            </div>
            <div className="d-flex justify-content-center mt-3">
              <PaginationBar page={page} setPage={setPage} totalPages={totalPages} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
