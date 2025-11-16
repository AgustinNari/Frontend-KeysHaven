import React, { useState, useEffect } from 'react';
import { getSellerStats, getSellerOrders } from '../../services/sellerService';
import PaginationBar from '../catalog/PaginationBar';

export default function SalesAnalytics({ sellerId }) {
  const [stats, setStats] = useState({
    totalSales: 0, totalRevenue: 0, activeProducts: 0, totalProducts: 0, avgRating: 0, pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange, sellerId, page]);

  const loadDashboardData = async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const statsData = await getSellerStats(sellerId, timeRange);
      setStats(statsData || {});

      const ordersResp = await getSellerOrders({ sellerId, page: Math.max(0, page - 1), size: pageSize, status: 'COMPLETED' });
      setRecentOrders(ordersResp.items || []);
      setTotalOrders(ordersResp.total || 0);

      setTopProducts([
        { id: 1, name: "Cyberpunk 2077", sold: 45, revenue: 2245.50 },
        { id: 2, name: "The Witcher 3", sold: 32, revenue: 1279.68 },
        { id: 3, name: "Red Dead Redemption 2", sold: 28, revenue: 1679.72 }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <h3 className="text-primary-light">${(stats.totalRevenue || 0).toLocaleString()}</h3>
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
            <h3 className="text-primary-light">{(stats.avgRating || 0).toFixed(1)}/5</h3>
            <p className="text-muted mb-0">Rating Promedio</p>
          </div>
        </div>
      </div>

      <div className="col-12 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
            <h6 className="text-primary-light mb-0">Órdenes Recientes</h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-dark table-borderless mb-0">
                <thead>
                  <tr><th>Orden ID</th><th>Cliente</th><th>Producto</th><th>Monto</th><th>Fecha</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {(recentOrders || []).map(order => (
                    <tr key={order.id}>
                      <td className="text-muted">#{order.id}</td>
                      <td className="text-primary-light">{order.buyerId || order.customerName || order.customer}</td>
                      <td>{(order.items && order.items[0] && order.items[0].productTitle) || order.productName || '-'}</td>
                      <td>${order.totalAmount || order.amount || 0}</td>
                      <td className="text-muted">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                      <td><span className="badge bg-success">Completado</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentOrders.length === 0 && <div className="text-center text-muted py-3">No hay órdenes recientes</div>}
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
