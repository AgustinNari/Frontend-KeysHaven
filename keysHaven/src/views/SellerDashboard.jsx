// src/pages/SellerDashboard.jsx
import React, { useState } from 'react';

export default function SellerDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');

  // Datos simulados del vendedor
  const [sellerStats] = useState({
    totalSales: 1234,
    totalRevenue: 5678,
    rating: 4.8,
    publishedGames: [
      { id: 1, name: "Cyberpunk 2077", stock: 50, sold: 100 },
      { id: 2, name: "The Witcher 3", stock: 25, sold: 75 },
      { id: 3, name: "Red Dead Redemption 2", stock: 75, sold: 50 }
    ],
    recentOrders: [
      { id: 1, user: "Usuario123", game: "Cyberpunk 2077", price: 29.99 },
      { id: 2, user: "Usuario456", game: "The Witcher 3", price: 19.99 },
      { id: 3, user: "Usuario789", game: "Red Dead Redemption 2", price: 39.99 }
    ]
  });

  const renderDashboard = () => (
    <div className="row">
      {/* Estadísticas principales */}
      <div className="col-md-4 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-body text-center">
            <h3 className="text-primary-light">{sellerStats.totalSales}</h3>
            <p className="text-muted mb-0">Ventas Totales</p>
          </div>
        </div>
      </div>
      
      <div className="col-md-4 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-body text-center">
            <h3 className="text-primary-light">${sellerStats.totalRevenue}</h3>
            <p className="text-muted mb-0">Ingresos Totales</p>
          </div>
        </div>
      </div>
      
      <div className="col-md-4 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-body text-center">
            <h3 className="text-primary-light">{sellerStats.rating}/5</h3>
            <p className="text-muted mb-0">Rating</p>
          </div>
        </div>
      </div>

      {/* Juegos Publicados */}
      <div className="col-12 mb-4">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid">
            <h5 className="text-primary-light mb-0">Juegos Publicados</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-dark table-borderless mb-0">
                <thead>
                  <tr>
                    <th>Juego</th>
                    <th>Stock</th>
                    <th>Vendidos</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerStats.publishedGames.map(game => (
                    <tr key={game.id}>
                      <td className="text-primary-light">{game.name}</td>
                      <td>{game.stock}</td>
                      <td>{game.sold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Órdenes Recientes */}
      <div className="col-12">
        <div className="card bg-primary-dark border-0">
          <div className="card-header bg-primary-mid">
            <h5 className="text-primary-light mb-0">Órdenes de Compra Recientes</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-dark table-borderless mb-0">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Juego</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerStats.recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="text-primary-light">{order.user}</td>
                      <td>{order.game}</td>
                      <td>${order.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid">
        <h5 className="text-primary-light mb-0">Gestión de Inventario</h5>
      </div>
      <div className="card-body">
        <p className="text-muted">Funcionalidad de gestión de inventario en desarrollo...</p>
        <button className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Agregar Nuevo Juego
        </button>
      </div>
    </div>
  );

  const renderPublishGame = () => (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid">
        <h5 className="text-primary-light mb-0">Publicar Nuevo Juego</h5>
      </div>
      <div className="card-body">
        <form>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Nombre del Juego</label>
              <input type="text" className="form-control bg-dark border-secondary text-white" />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Precio</label>
              <input type="number" className="form-control bg-dark border-secondary text-white" />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Stock</label>
              <input type="number" className="form-control bg-dark border-secondary text-white" />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Plataforma</label>
              <select className="form-select bg-dark border-secondary text-white">
                <option>PC</option>
                <option>PlayStation</option>
                <option>Xbox</option>
                <option>Nintendo Switch</option>
              </select>
            </div>
            <div className="col-12 mb-3">
              <label className="form-label text-primary-light">Descripción</label>
              <textarea className="form-control bg-dark border-secondary text-white" rows="3"></textarea>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Publicar Juego</button>
        </form>
      </div>
    </div>
  );

  return (
    <div data-bs-theme="dark" className="bg-body text-body min-vh-100">
      <div className="container-fluid py-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2">
            <div className="card bg-primary-dark border-0 sticky-top" style={{top: '86px'}}>
              <div className="card-body">
                <div className="text-center mb-4">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style={{width: '60px', height: '60px'}}>
                    <span className="fw-bold">A</span>
                  </div>
                  <h6 className="text-primary-light mt-2 mb-1">Bienvenido, Alex</h6>
                  <small className="text-muted">Vendedor</small>
                </div>

                <nav className="nav flex-column">
                  <button 
                    className={`nav-link text-start btn btn-link text-decoration-none p-2 mb-1 ${
                      activeSection === 'dashboard' ? 'bg-primary-mid text-primary' : 'text-primary-light'
                    }`}
                    onClick={() => setActiveSection('dashboard')}
                  >
                    <i className="fas fa-chart-bar me-2"></i>
                    Dashboard
                  </button>
                  <button 
                    className={`nav-link text-start btn btn-link text-decoration-none p-2 mb-1 ${
                      activeSection === 'inventory' ? 'bg-primary-mid text-primary' : 'text-primary-light'
                    }`}
                    onClick={() => setActiveSection('inventory')}
                  >
                    <i className="fas fa-boxes me-2"></i>
                    Inventario
                  </button>
                  <button 
                    className={`nav-link text-start btn btn-link text-decoration-none p-2 mb-1 ${
                      activeSection === 'publish' ? 'bg-primary-mid text-primary' : 'text-primary-light'
                    }`}
                    onClick={() => setActiveSection('publish')}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Publicar Juego
                  </button>
                  <button 
                    className={`nav-link text-start btn btn-link text-decoration-none p-2 mb-1 ${
                      activeSection === 'orders' ? 'bg-primary-mid text-primary' : 'text-primary-light'
                    }`}
                    onClick={() => setActiveSection('orders')}
                  >
                    <i className="fas fa-shopping-cart me-2"></i>
                    Órdenes
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="col-md-9 col-lg-10">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="text-primary-light">Dashboard del Vendedor</h1>
            </div>

            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'inventory' && renderInventory()}
            {activeSection === 'publish' && renderPublishGame()}
            {activeSection === 'orders' && renderDashboard()}
          </div>
        </div>
      </div>
    </div>
  );
}