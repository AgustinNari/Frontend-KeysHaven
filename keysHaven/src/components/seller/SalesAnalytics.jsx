import React, { useState, useEffect } from 'react';
import { getSellerStats, getSellerOrders } from '../../services/sellerService';

export default function SalesAnalytics() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    activeProducts: 0,
    totalProducts: 0,
    averageRating: 0,
    pendingOrders: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // month, week, year

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // En un entorno real, estos vendrían de endpoints específicos
      const [statsData, ordersData] = await Promise.all([
        getSellerStats(timeRange),
        getSellerOrders({ limit: 5, status: 'completed' })
      ]);
      
      setStats(statsData);
      setRecentOrders(ordersData.items || []);
      
      // Simular productos más vendidos
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
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <div className="mt-2">Cargando datos del dashboard...</div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* Filtro de tiempo */}
      <div className="col-12 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-body py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="text-primary-light mb-0">Resumen de Ventas</h6>
              <div className="btn-group btn-group-sm">
                {['week', 'month', 'year'].map(range => (
                  <button
                    key={range}
                    className={`btn ${timeRange === range ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setTimeRange(range)}
                  >
                    {range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : 'Año'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2">
              <i className="fas fa-shopping-cart fa-2x"></i>
            </div>
            <h3 className="text-primary-light">{stats.totalSales}</h3>
            <p className="text-muted mb-0">Ventas Totales</p>
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
      
      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2">
              <i className="fas fa-box fa-2x"></i>
            </div>
            <h3 className="text-primary-light">{stats.activeProducts}/{stats.totalProducts}</h3>
            <p className="text-muted mb-0">Productos Activos</p>
          </div>
        </div>
      </div>
      
      <div className="col-md-3 mb-4">
        <div className="card bg-primary-dark border-0 h-100">
          <div className="card-body text-center">
            <div className="text-primary mb-2">
              <i className="fas fa-star fa-2x"></i>
            </div>
            <h3 className="text-primary-light">{stats.averageRating}/5</h3>
            <p className="text-muted mb-0">Rating Promedio</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Ventas (Placeholder) */}
      <div className="col-md-8 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid">
            <h6 className="text-primary-light mb-0">Tendencia de Ventas</h6>
          </div>
          <div className="card-body">
            <div className="text-center text-muted py-5">
              <i className="fas fa-chart-line fa-3x mb-3"></i>
              <p>Gráfico de ventas se mostraría aquí</p>
              <small>Integración con librerías de gráficos como Chart.js</small>
            </div>
          </div>
        </div>
      </div>

      {/* Productos Más Vendidos */}
      <div className="col-md-4 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid">
            <h6 className="text-primary-light mb-0">Productos Más Vendidos</h6>
          </div>
          <div className="card-body">
            {topProducts.map(product => (
              <div key={product.id} className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
                <div>
                  <div className="text-primary-light small fw-bold">{product.name}</div>
                  <small className="text-muted">{product.sold} unidades</small>
                </div>
                <div className="text-end">
                  <div className="text-primary-light">${product.revenue}</div>
                  <small className="text-muted">ingresos</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Órdenes Recientes */}
      <div className="col-12 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
            <h6 className="text-primary-light mb-0">Órdenes Recientes</h6>
            <button className="btn btn-outline-primary btn-sm">
              Ver Todas
            </button>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-dark table-borderless mb-0">
                <thead>
                  <tr>
                    <th>Orden ID</th>
                    <th>Cliente</th>
                    <th>Producto</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="text-muted">#{order.id}</td>
                      <td className="text-primary-light">{order.customerName}</td>
                      <td>{order.productName}</td>
                      <td>${order.amount}</td>
                      <td className="text-muted">{new Date(order.date).toLocaleDateString()}</td>
                      <td>
                        <span className="badge bg-success">Completado</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentOrders.length === 0 && (
                <div className="text-center text-muted py-3">
                  No hay órdenes recientes
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="col-12">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid">
            <h6 className="text-primary-light mb-0">Métricas Rápidas</h6>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-2">
                <div className="text-primary-light h4 mb-1">{stats.pendingOrders}</div>
                <small className="text-muted">Órdenes Pendientes</small>
              </div>
              <div className="col-md-2">
                <div className="text-primary-light h4 mb-1">24h</div>
                <small className="text-muted">Tiempo Respuesta</small>
              </div>
              <div className="col-md-2">
                <div className="text-primary-light h4 mb-1">98%</div>
                <small className="text-muted">Tasa de Satisfacción</small>
              </div>
              <div className="col-md-2">
                <div className="text-primary-light h4 mb-1">12</div>
                <small className="text-muted">Reclamos este mes</small>
              </div>
              <div className="col-md-2">
                <div className="text-primary-light h4 mb-1">45</div>
                <small className="text-muted">Clientes Nuevos</small>
              </div>
              <div className="col-md-2">
                <div className="text-primary-light h4 mb-1">5.0</div>
                <small className="text-muted">Rating Promedio</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}