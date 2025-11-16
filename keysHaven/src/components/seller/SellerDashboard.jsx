import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateUser, getUserById } from '../../services/usersService';

import ProductList from './ProductList';
import ProductForm from './ProductForm';
import KeyManagement from './KeyManagement';
import SalesAnalytics from './SalesAnalytics';
import SellerCoupons from './SellerCoupons';
import ErrorBoundary from '../common/ErrorBoundary';

export default function SellerDashboard() {
  const { user, loading: authLoading, isAuthenticated, hasRole, refreshUser, setUser } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState(null);
  const [sellerData, setSellerData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    sellerDescription: ''
  });
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const [descriptionError, setDescriptionError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (!hasRole || !hasRole('SELLER')) {
        if (user?.role !== 'SELLER') navigate('/403', { replace: true });
      } else {
        if (user) {
          setSellerData({
            displayName: user.displayName || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            country: user.country || '',
            sellerDescription: user.sellerDescription || ''
          });
        }
      }
    }
  }, [authLoading, isAuthenticated, hasRole, navigate, user]);


const handleUpdateDescription = async () => {
  if (!sellerData.sellerDescription || !sellerData.sellerDescription.trim()) return;
  setDescriptionLoading(true);
  setDescriptionError('');
  try {
    await updateUser(user.id, { sellerDescription: sellerData.sellerDescription });

    try {
      if (typeof refreshUser === 'function') {
        const refreshed = await refreshUser();
        if (refreshed) {
          setSellerData(prev => ({ ...prev, sellerDescription: refreshed.sellerDescription ?? sellerData.sellerDescription }));
        } else {
          const byId = await getUserById(user.id);
          if (byId) {
            if (typeof setUser === 'function') setUser(byId);
            setSellerData(prev => ({ ...prev, sellerDescription: byId.sellerDescription ?? sellerData.sellerDescription }));
          } else {
            setSellerData(prev => ({ ...prev, sellerDescription: sellerData.sellerDescription }));
          }
        }
      } else if (typeof setUser === 'function') {
        const byId = await getUserById(user.id);
        if (byId) {
          setUser(byId);
          setSellerData(prev => ({ ...prev, sellerDescription: byId.sellerDescription ?? sellerData.sellerDescription }));
        } else {
          setSellerData(prev => ({ ...prev, sellerDescription: sellerData.sellerDescription }));
        }
      } else {
        setSellerData(prev => ({ ...prev, sellerDescription: sellerData.sellerDescription }));
      }
    } catch (ctxErr) {
      console.warn("No se pudo refrescar el usuario tras actualizar descripción:", ctxErr);
      try {
        const byId = await getUserById(user.id);
        if (byId) {
          if (typeof setUser === 'function') setUser(byId);
          setSellerData(prev => ({ ...prev, sellerDescription: byId.sellerDescription ?? sellerData.sellerDescription }));
        } else {
          setSellerData(prev => ({ ...prev, sellerDescription: sellerData.sellerDescription }));
        }
      } catch (byIdErr) {
        console.warn("getUserById failed:", byIdErr);
        setSellerData(prev => ({ ...prev, sellerDescription: sellerData.sellerDescription }));
      }
    }

    setIsEditingDescription(false);
  } catch (err) {
    console.error("Error actualizando descripción:", err);
    setDescriptionError(err?.message || 'Error actualizando descripción');
  } finally {
    setDescriptionLoading(false);
  }
};

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div>
            <div className="card bg-primary-dark border-0 mb-4">
              <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
                <h5 className="text-primary-light mb-0">Descripción del Vendedor</h5>
                {!isEditingDescription ? (
                  <button className="btn btn-outline-primary btn-sm" onClick={() => setIsEditingDescription(true)}>
                    <i className="fas fa-edit me-1"></i> Editar Descripción
                  </button>
                ) : (
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-primary btn-sm" onClick={handleUpdateDescription} disabled={descriptionLoading}>
                      {descriptionLoading ? (<><span className="spinner-border spinner-border-sm me-1"></span>Guardando...</>) : (<> <i className="fas fa-check me-1"></i> Guardar</>)}
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => { setIsEditingDescription(false); setSellerData(prev => ({ ...prev, sellerDescription: user?.sellerDescription || '' })); }}>
                      <i className="fas fa-times me-1"></i> Cancelar
                    </button>
                  </div>
                )}
              </div>
              <div className="card-body">
                {descriptionError && <div className="alert alert-danger">{descriptionError}</div>}
                {isEditingDescription ? (
                  <div>
                    <textarea className="form-control bg-dark border-secondary text-white" rows="4" value={sellerData.sellerDescription} onChange={(e) => setSellerData({ ...sellerData, sellerDescription: e.target.value })} />
                    <small className="text-muted mt-2">Esta descripción será visible para los compradores en tu perfil de vendedor.</small>
                  </div>
                ) : (
                  <div>
                    <p className="text-primary-light mb-0">{sellerData.sellerDescription || 'No hay descripción disponible. Haz clic en "Editar Descripción" para agregar una.'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card bg-primary-dark border-0 mb-4">
              <div className="card-header bg-primary-mid">
                <h5 className="text-primary-light mb-0">Información del Vendedor</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label text-primary-light small mb-1">Nombre para mostrar</label>
                      <p className="text-white">{sellerData.displayName}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-primary-light small mb-1">Email</label>
                      <p className="text-white">{sellerData.email}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label text-primary-light small mb-1">Teléfono</label>
                      <p className="text-white">{sellerData.phone || 'No especificado'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-primary-light small mb-1">País</label>
                      <p className="text-white">{sellerData.country || 'No especificado'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SalesAnalytics sellerId={user?.id} />
          </div>
        );

      case 'products':
        return <ProductList onEditProduct={async (product) => { setEditingProduct(product); setActiveSection('add-product'); }} />;

      case 'add-product':
        return (
          <ErrorBoundary>
            <ProductForm product={editingProduct} onSuccess={() => { setEditingProduct(null); setActiveSection('products'); }} />
          </ErrorBoundary>
        );
      case 'keys':
        return <KeyManagement />;

      case 'coupons':
        return <SellerCoupons />;

      default:
        return <SalesAnalytics sellerId={user?.id} />;
    }
  };

  if (authLoading) {
    return (
      <div className="text-center text-muted py-5">
        <div className="spinner-border" role="status"></div>
        <div className="mt-2">Verificando permisos...</div>
      </div>
    );
  }

  return (
    <div data-bs-theme="dark" className="bg-body text-body min-vh-100">
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-md-3 col-lg-2">
            <div className="card bg-primary-dark border-0" style={{ top: '86px' }}>
              <div className="card-body">
                <div className="text-center mb-4">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <span className="fw-bold">V</span>
                  </div>
                  <h6 className="text-primary-light mt-2 mb-1">{sellerData.displayName}</h6>
                  <small className="text-muted">Vendedor Verificado</small>
                  {sellerData.sellerDescription && (
                    <div className="mt-2">
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>{sellerData.sellerDescription.length > 50 ? `${sellerData.sellerDescription.substring(0, 50)}...` : sellerData.sellerDescription}</small>
                    </div>
                  )}
                </div>
                <nav className="nav flex-column">
                  {[
                    { id: 'dashboard', icon: 'fas fa-chart-bar', label: 'Dashboard' },
                    { id: 'products', icon: 'fas fa-boxes', label: 'Mis Productos' },
                    { id: 'add-product', icon: 'fas fa-plus', label: 'Crear Producto' },
                    { id: 'keys', icon: 'fas fa-key', label: 'Gestión de Claves' },
                    { id: 'coupons', icon: 'fas fa-tag', label: 'Cupones' }
                  ].map(item => (
                    <button key={item.id} className={`nav-link text-start btn btn-link text-decoration-none p-2 mb-1 ${activeSection === item.id ? 'bg-primary-mid text-primary' : 'text-primary-light'}`} onClick={() => { setActiveSection(item.id); if (item.id !== 'add-product') setEditingProduct(null); }}>
                      <i className={`${item.icon} me-2`}></i>{item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          <div className="col-md-9 col-lg-10">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="text-primary-light">{activeSection === 'add-product' ? (editingProduct ? 'Editar Producto' : 'Crear Producto') : (activeSection === 'products' ? 'Mis Productos' : activeSection === 'dashboard' ? 'Dashboard de Ventas' : 'Dashboard')}</h1>
              {activeSection === 'add-product' && editingProduct && (
                <button className="btn btn-outline-secondary" onClick={() => { setEditingProduct(null); setActiveSection('products'); }}>← Volver a productos</button>
              )}
              {activeSection === 'products' && (
                <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setActiveSection('add-product'); }}><i className="fas fa-plus me-2"></i> Nuevo Producto</button>
              )}
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
