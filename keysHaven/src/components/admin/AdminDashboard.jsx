import React, { useState, useEffect } from 'react';
import { getAdminStats, getPlatformMetrics, getRecentActivity } from '../../services/adminService';
import PaginationBar from '../catalog/PaginationBar';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeSellers: 0,
    pendingReviews: 0
  });

  const [platformMetrics, setPlatformMetrics] = useState({
    uptime: 0,
    responseTime: 0,
    dailyVisits: 0,
    platformRating: 0,
    activeSupport: 0,
    incidents: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);


  const [activityPage, setActivityPage] = useState(1);
  const activityPageSize = 6;
  const totalActivityPages = Math.max(1, Math.ceil(recentActivity.length / activityPageSize));

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activityPage > totalActivityPages) setActivityPage(totalActivityPages);
  }, [recentActivity, totalActivityPages, activityPage]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, metricsData, activityData] = await Promise.all([
        getAdminStats(),
        getPlatformMetrics(),
        getRecentActivity()
      ]);
      
      setStats(statsData);
      setPlatformMetrics(metricsData);
      setRecentActivity(activityData || []);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-muted py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <div className="mt-2">Cargando dashboard...</div>
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
            <div className="text-primary mb-2">
              <i className="fas fa-users fa-2x"></i>
            </div>
            <h3 className="text-primary-light">{stats.totalUsers}</h3>
            <p className="text-muted mb-0">Usuarios Totales</p>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2">
              <i className="fas fa-box fa-2x"></i>
            </div>
            <h3 className="text-primary-light">{stats.totalProducts}</h3>
            <p className="text-muted mb-0">Productos Totales</p>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2">
              <i className="fas fa-shopping-cart fa-2x"></i>
            </div>
            <h3 className="text-primary-light">{stats.totalOrders}</h3>
            <p className="text-muted mb-0">Órdenes Totales</p>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2">
              <i className="fas fa-dollar-sign fa-2x"></i>
            </div>
            <h3 className="text-primary-light">${stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-muted mb-0">Ingresos Totales</p>
          </div>
        </div>
      </div>

      {/* Estadísticas Secundarias */}
      <div className="col-md-4 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid">
            <h6 className="text-primary-light mb-0">Resumen de Plataforma</h6>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary-light">Vendedores Activos</span>
              <span className="badge bg-success">{stats.activeSellers}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary-light">Reseñas Pendientes</span>
              <span className="badge bg-warning">{stats.pendingReviews}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary-light">Productos Activos</span>
              <span className="badge bg-info">{stats.totalProducts}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-primary-light">Órdenes Hoy</span>
              <span className="badge bg-primary">24</span>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-8 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid">
            <h6 className="text-primary-light mb-0">Actividad Reciente</h6>
          </div>
          <div className="card-body">
            {activityPageItems.map(activity => (
              <div key={activity.id} className="d-flex align-items-start mb-3 pb-2 border-bottom border-secondary">
                <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                  activity.type === 'user' ? 'bg-success' :
                  activity.type === 'order' ? 'bg-primary' : 'bg-info'
                }`} style={{width: '40px', height: '40px'}}>
                  <i className={`fas ${
                    activity.type === 'user' ? 'fa-user' :
                    activity.type === 'order' ? 'fa-shopping-cart' : 'fa-box'
                  } text-white`}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="text-primary-light">{activity.action}</div>
                  <small className="text-muted">
                    {activity.user}
                    {activity.product && ` • ${activity.product}`}
                    {activity.amount && ` • ${activity.amount}`}
                  </small>
                </div>
                <div className="text-muted small">
                  {new Date(activity.time).toLocaleTimeString()}
                </div>
              </div>
            ))}

            <div className="d-flex justify-content-center mt-3">
              <PaginationBar page={activityPage} setPage={setActivityPage} totalPages={Math.max(1, totalActivityPages)} />
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="col-12">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid">
            <h6 className="text-primary-light mb-0">Métricas de la Plataforma</h6>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-2">
                <div className="text-primary-light h4 mb-1">{platformMetrics.uptime}%</div>
                <small className="text-muted">Uptime</small>
              </div>
              <div className="col-md-2">
                <div className="text-primary-light h4 mb-1">{platformMetrics.responseTime}s</div>
                <small className="text-muted">Tiempo Respuesta</small>
              </div>
              <div className="col-md-2">
                <div className="text-primary-light h4 mb-1">{platformMetrics.dailyVisits}</div>
                <small className="text-muted">Visitas Hoy</small>
              </div>
              <div className="col-md-2">
                <div className="text-primary-light h4 mb-1">{platformMetrics.platformRating}</div>
                <small className="text-muted">Rating Plataforma</small>
              </div>
              <div className="col-md-2">
                <div className="text-primary-light h4 mb-1">{platformMetrics.activeSupport}</div>
                <small className="text-muted">Soporte Activo</small>
              </div>
              <div className="col-md-2">
                <div className="text-primary-light h4 mb-1">{platformMetrics.incidents}</div>
                <small className="text-muted">Incidentes</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
