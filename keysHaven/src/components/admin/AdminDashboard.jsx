import { displayValue } from '../../utils/displayText';
import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchAdminStats, fetchPlatformMetrics, fetchRecentActivity } from '../../redux/slices/adminPanelSlice';
import PaginationBar from '../catalog/PaginationBar';

const emptyActivity = [];

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector(state => state.adminPanel);

  const stats = admin.stats ?? {
    totalUsers: 0, totalProducts: 0, totalActiveProducts: 0,
    totalOrders: 0, ordersToday: 0, totalReviews: 0, totalRevenue: 0, activeSellers: 0
  };

  const platformMetrics = admin.platformMetrics ?? { uptime: 0, responseTime: 0, dailyVisits: 0, platformRating: 0, activeSupport: 0, incidents: 0 };
  const recentActivity = admin.recentActivity ?? emptyActivity;

  const [loadingLocal, setLoadingLocal] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const activityPageSize = 6;
  const totalActivityPages = Math.max(1, Math.ceil(recentActivity.length / activityPageSize));

  const loadDashboardData = useCallback(async ({ needsStats = true, needsMetrics = true, needsActivity = true } = {}) => {
    setLoadingLocal(true);
    try {
      const promises = [];
      if (needsStats) promises.push(dispatch(fetchAdminStats()).unwrap());
      if (needsMetrics) promises.push(dispatch(fetchPlatformMetrics()).unwrap());
      if (needsActivity) promises.push(dispatch(fetchRecentActivity()).unwrap());
      await Promise.all(promises);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoadingLocal(false);
    }
  }, [dispatch]);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  useEffect(() => {
    if (activityPage > totalActivityPages) setActivityPage(totalActivityPages);
  }, [recentActivity, totalActivityPages, activityPage]);

  if (loadingLocal) {
    return (
      <div className="text-center text-muted py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <div className="mt-2">Cargando resumen...</div>
      </div>
    );
  }

  const activityStart = (activityPage - 1) * activityPageSize;
  const activityPageItems = recentActivity.slice(activityStart, activityStart + activityPageSize);


  return (
    <div className="row">
      {/* Tarjetas Principales */}
      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2"><i className="fas fa-users fa-2x"></i></div>
            <h3 className="text-primary-light">{stats.totalUsers}</h3>
            <p className="text-muted mb-0">Usuarios Totales</p>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2"><i className="fas fa-box fa-2x"></i></div>
            <h3 className="text-primary-light">{stats.totalProducts}</h3>
            <p className="text-muted mb-0">Productos Totales</p>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2"><i className="fas fa-shopping-cart fa-2x"></i></div>
            <h3 className="text-primary-light">{stats.totalOrders}</h3>
            <p className="text-muted mb-0">Órdenes Totales</p>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2"><i className="fas fa-dollar-sign fa-2x"></i></div>
            <h3 className="text-primary-light">${Number(stats.totalRevenue || 0).toLocaleString()}</h3>
            <p className="text-muted mb-0">Ingresos Totales</p>
          </div>
        </div>
      </div>

      <div className="col-md-4 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid"><h6 className="text-primary-light mb-0">Resumen de Plataforma</h6></div>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary-light">Vendedores Activos</span>
              <span className="badge bg-success">{stats.activeSellers}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary-light">Reseñas Totales</span>
              <span className="badge bg-warning">{stats.totalReviews}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary-light">Productos activos disponibles</span>
              <span className="badge bg-info">{stats.totalActiveProducts}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-primary-light">Órdenes Hoy</span>
              <span className="badge bg-primary">{stats.ordersToday}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-8 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid"><h6 className="text-primary-light mb-0">Actividad Reciente</h6></div>
          <div className="card-body">
            {activityPageItems.map(activity => {
              let bgClass = 'bg-info';
              let icon = 'fa-box';
              if (activity.type === 'user') {
                if ((activity.role || '').toUpperCase() === 'SELLER') { bgClass = 'bg-warning'; icon = 'fa-store'; }
                else if ((activity.role || '').toUpperCase() === 'ADMIN') { bgClass = 'bg-danger'; icon = 'fa-user-shield'; }
                else { bgClass = 'bg-success'; icon = 'fa-user'; }
              } else if (activity.type === 'order') { bgClass = 'bg-primary'; icon = 'fa-shopping-cart'; }
              else if (activity.type === 'review') { bgClass = 'bg-secondary'; icon = 'fa-comments'; }
              else if (activity.type === 'product') { bgClass = 'bg-info'; icon = activity.action && activity.action.toLowerCase().includes('desactiv') ? 'fa-box-open' : 'fa-box'; }

              return (
                <div key={activity.id} className="d-flex align-items-start mb-3 pb-2 border-bottom border-secondary">
                  <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${bgClass}`} style={{width: '40px', height: '40px'}}>
                    <i className={`fas ${icon} text-white`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="text-primary-light">{activity.action}</div>
                    <small className="text-muted">
                      {activity.user}
                      {activity.product && ` • ${activity.product}`}
                      {activity.amount && ` • ${activity.amount}`}
                      {activity.role && ` • ${displayValue(activity.role)}`}
                    </small>
                  </div>
                  <div className="text-muted small">
                    {activity.time ? new Date(activity.time).toLocaleString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              );
            })}

            <div className="d-flex justify-content-center mt-3">
              <PaginationBar page={activityPage} setPage={setActivityPage} totalPages={totalActivityPages} />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid"><h6 className="text-primary-light mb-0">Métricas de la Plataforma</h6></div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-2"><div className="text-primary-light h4 mb-1">{platformMetrics.uptime}%</div><small className="text-muted">Tiempo de actividad</small></div>
              <div className="col-md-2"><div className="text-primary-light h4 mb-1">{platformMetrics.responseTime}s</div><small className="text-muted">Tiempo Respuesta</small></div>
              <div className="col-md-2"><div className="text-primary-light h4 mb-1">{platformMetrics.dailyVisits}</div><small className="text-muted">Visitas Hoy</small></div>
              <div className="col-md-2"><div className="text-primary-light h4 mb-1">{platformMetrics.platformRating}</div><small className="text-muted">Puntuación de la plataforma</small></div>
              <div className="col-md-2"><div className="text-primary-light h4 mb-1">{platformMetrics.activeSupport}</div><small className="text-muted">Soporte Activo</small></div>
              <div className="col-md-2"><div className="text-primary-light h4 mb-1">{platformMetrics.incidents}</div><small className="text-muted">Incidentes</small></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
