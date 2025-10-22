import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import CouponManagement from './CouponManagement';
import AdminDashboard from './AdminDashboard';
import ReviewsManagement from './ReviewsManagement';
import { useAuth } from '../../context/AuthContext';

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user, loading: authLoading, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (!hasRole('ADMIN')) {
        navigate('/403', { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, hasRole, navigate]);

  if (authLoading) {
    return (
      <div className="text-center text-muted py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <div className="mt-2">Verificando permisos...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'products':
        return <ProductManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'coupons':
        return <CouponManagement />;
      case 'reviews':
        return <ReviewsManagement />;
      case 'dashboard':
      default:
        return <AdminDashboard />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard': return 'Dashboard de Administración';
      case 'users': return 'Gestión de Usuarios';
      case 'products': return 'Gestión Global de Productos';
      case 'categories': return 'Gestión de Categorías';
      case 'coupons': return 'Cupones Globales';
      case 'reviews': return 'Gestión de Reseñas';
      default: return 'Dashboard de Administración';
    }
  };

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
                  <h6 className="text-primary-light mt-2 mb-1">Panel Administrador</h6>
                  <small className="text-muted">Gestión completa</small>
                </div>

                <nav className="nav flex-column">
                  {[
                    { id: 'dashboard', icon: 'fas fa-chart-bar', label: 'Dashboard' },
                    { id: 'users', icon: 'fas fa-users', label: 'Usuarios' },
                    { id: 'products', icon: 'fas fa-gamepad', label: 'Productos' },
                    { id: 'categories', icon: 'fas fa-tags', label: 'Categorías' },
                    { id: 'coupons', icon: 'fas fa-tag', label: 'Cupones' },
                    { id: 'reviews', icon: 'fas fa-comments', label: 'Reseñas' }
                  ].map(item => (
                    <button
                      key={item.id}
                      className={`nav-link text-start btn btn-link text-decoration-none p-2 mb-1 ${
                        activeSection === item.id ? 'bg-primary-mid text-primary' : 'text-primary-light'
                      }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <i className={`${item.icon} me-2`}></i>
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="col-md-9 col-lg-10">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="text-primary-light">{getSectionTitle()}</h1>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
