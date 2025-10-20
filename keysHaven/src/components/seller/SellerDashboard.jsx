import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import KeyManagement from './KeyManagement';
import SalesAnalytics from './SalesAnalytics';
import SellerCoupons from './SellerCoupons';
import { 
  getSellerProducts, 
  createProduct, 
  updateProduct,
  deleteProduct,
  getSellerStats,
  getSellerOrders
} from '../../services/sellerService';
import { mockUsers } from '../../data/mockData';

export default function SellerDashboard() {
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

  // Cargar datos del vendedor desde mockUsers
  useEffect(() => {
    loadSellerData();
  }, []);

  const loadSellerData = () => {
    try {
      // Buscar el usuario vendedor (ID 2 en mockUsers)
      const sellerUser = mockUsers.find(user => user.id === 2 && user.role === 'SELLER');
      
      if (sellerUser) {
        setSellerData({
          displayName: sellerUser.displayName || '',
          firstName: sellerUser.firstName || '',
          lastName: sellerUser.lastName || '',
          email: sellerUser.email || '',
          phone: sellerUser.phone || '',
          country: sellerUser.country || '',
          sellerDescription: sellerUser.sellerDescription || ''
        });
      }
    } catch (error) {
      console.error('Error cargando datos del vendedor:', error);
    }
  };

  const handleUpdateDescription = async () => {
    if (!sellerData.sellerDescription.trim()) return;
    
    setDescriptionLoading(true);
    try {
      // Simulación de actualización - en una app real esto llamaría a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Actualizar el mockUser (en una app real esto se haría en el backend)
      const sellerIndex = mockUsers.findIndex(user => user.id === 2);
      if (sellerIndex !== -1) {
        mockUsers[sellerIndex] = {
          ...mockUsers[sellerIndex],
          sellerDescription: sellerData.sellerDescription
        };
      }
      
      setIsEditingDescription(false);
      console.log('Descripción actualizada:', sellerData.sellerDescription);
    } catch (error) {
      console.error('Error actualizando descripción:', error);
    } finally {
      setDescriptionLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div>
            {/* Sección de descripción del vendedor */}
            <div className="card bg-primary-dark border-0 mb-4">
              <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
                <h5 className="text-primary-light mb-0">Descripción del Vendedor</h5>
                {!isEditingDescription ? (
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Editar Descripción
                  </button>
                ) : (
                  <div className="btn-group btn-group-sm">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={handleUpdateDescription}
                      disabled={descriptionLoading || !sellerData.sellerDescription.trim()}
                    >
                      {descriptionLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check me-1"></i>
                          Guardar
                        </>
                      )}
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => {
                        setIsEditingDescription(false);
                        loadSellerData(); // Recargar valor original
                      }}
                      disabled={descriptionLoading}
                    >
                      <i className="fas fa-times me-1"></i>
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
              <div className="card-body">
                {isEditingDescription ? (
                  <div>
                    <textarea
                      className="form-control bg-dark border-secondary text-white"
                      rows="4"
                      value={sellerData.sellerDescription}
                      onChange={(e) => setSellerData({...sellerData, sellerDescription: e.target.value})}
                      placeholder="Describe tu negocio, experiencia, tipos de productos que ofreces, etc..."
                      disabled={descriptionLoading}
                    />
                    <small className="text-muted mt-2">
                      Esta descripción será visible para los compradores en tu perfil de vendedor.
                    </small>
                  </div>
                ) : (
                  <div>
                    <p className="text-primary-light mb-0">
                      {sellerData.sellerDescription || 'No hay descripción disponible. Haz clic en "Editar Descripción" para agregar una.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Información del vendedor */}
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
            
            {/* Dashboard normal */}
            <SalesAnalytics />
          </div>
        );
      case 'products':
        return <ProductList onEditProduct={(product) => {
          setEditingProduct(product);
          setActiveSection('add-product');
        }} />;
      case 'add-product':
        return <ProductForm 
          product={editingProduct} 
          onSuccess={() => {
            setEditingProduct(null);
            setActiveSection('products');
          }} 
        />;
      case 'keys':
        return <KeyManagement />;
      case 'coupons':
        return <SellerCoupons />;
      default:
        return <SalesAnalytics />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard': return 'Dashboard de Ventas';
      case 'products': return 'Mis Productos';
      case 'add-product': return editingProduct ? 'Editar Producto' : 'Crear Producto';
      case 'keys': return 'Gestión de Claves';
      case 'coupons': return 'Cupones y Descuentos';
      default: return 'Dashboard de Ventas';
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
                    <span className="fw-bold">V</span>
                  </div>
                  <h6 className="text-primary-light mt-2 mb-1">{sellerData.displayName}</h6>
                  <small className="text-muted">Vendedor Verificado</small>
                  {sellerData.sellerDescription && (
                    <div className="mt-2">
                      <small className="text-muted" style={{fontSize: '0.7rem'}}>
                        {sellerData.sellerDescription.length > 50 
                          ? `${sellerData.sellerDescription.substring(0, 50)}...` 
                          : sellerData.sellerDescription
                        }
                      </small>
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
                    <button 
                      key={item.id}
                      className={`nav-link text-start btn btn-link text-decoration-none p-2 mb-1 ${
                        activeSection === item.id ? 'bg-primary-mid text-primary' : 'text-primary-light'
                      }`}
                      onClick={() => {
                        setActiveSection(item.id);
                        if (item.id !== 'add-product') setEditingProduct(null);
                      }}
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
              {activeSection === 'add-product' && editingProduct && (
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setEditingProduct(null);
                    setActiveSection('products');
                  }}
                >
                  ← Volver a productos
                </button>
              )}
              {activeSection === 'products' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingProduct(null);
                    setActiveSection('add-product');
                  }}
                >
                  <i className="fas fa-plus me-2"></i>
                  Nuevo Producto
                </button>
              )}
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}