import React, { useState, useEffect } from 'react';
import { getAllProducts, updateProduct, deleteProduct } from '../../services/adminService';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsData = await getAllProducts();
      setProducts(productsData);
    } catch (err) {
      console.error('Error cargando productos:', err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await updateProduct(product.id, { active: !product.active });
      await loadProducts(); // Recargar lista
    } catch (err) {
      console.error('Error actualizando producto:', err);
      setError('Error al actualizar producto');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await deleteProduct(productId);
      await loadProducts(); // Recargar lista
    } catch (err) {
      console.error('Error eliminando producto:', err);
      setError('Error al eliminar producto');
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sellerDisplayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? product.active : !product.active);
    
    return matchesSearch && matchesStatus;
  });

  const getStockStatus = (stock) => {
    if (stock > 10) return { class: 'bg-success', text: 'En stock' };
    if (stock > 0) return { class: 'bg-warning', text: 'Stock bajo' };
    return { class: 'bg-danger', text: 'Sin stock' };
  };

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid">
        <h5 className="text-primary-light mb-0">Gestión Global de Productos</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label text-primary-light">Buscar</label>
            <input
              type="text"
              className="form-control bg-dark border-secondary text-white"
              placeholder="Nombre del producto o vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label text-primary-light">Estado</label>
            <select
              className="form-select bg-dark border-secondary text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button 
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="table-responsive">
          <table className="table table-dark table-borderless">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Vendedor</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Plataforma</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    Cargando productos...
                  </td>
                </tr>
              ) : filteredProducts.map(product => {
                const stockStatus = getStockStatus(product.availableStock);
                return (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <div className="text-primary-light fw-bold">{product.title}</div>
                        {product.categories && (
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {Array.from(product.categories).slice(0, 2).map(category => (
                              <span key={category.id} className="badge bg-secondary small">
                                {category.description}
                              </span>
                            ))}
                            {product.categories.size > 2 && (
                              <span className="badge bg-secondary small">
                                +{product.categories.size - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-white">{product.sellerDisplayName}</div>
                      <small className="text-muted">ID: {product.sellerId}</small>
                    </td>
                    <td>
                      <div className="text-primary-light fw-bold">
                        {product.currency} {product.price}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${stockStatus.class}`}>
                        {product.availableStock} - {stockStatus.text}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info">{product.platform}</span>
                    </td>
                    <td>
                      <span className={`badge ${product.active ? 'bg-success' : 'bg-danger'}`}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-warning"
                          onClick={() => handleToggleStatus(product)}
                        >
                          {product.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center text-muted py-4">
              No se encontraron productos que coincidan con los filtros
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="row mt-4">
          <div className="col-md-3">
            <div className="card bg-primary-mid border-0">
              <div className="card-body text-center py-3">
                <h4 className="text-primary-light mb-1">{products.length}</h4>
                <p className="text-muted mb-0 small">Total Productos</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-primary-mid border-0">
              <div className="card-body text-center py-3">
                <h4 className="text-primary-light mb-1">
                  {products.filter(p => p.active).length}
                </h4>
                <p className="text-muted mb-0 small">Productos Activos</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-primary-mid border-0">
              <div className="card-body text-center py-3">
                <h4 className="text-primary-light mb-1">
                  {products.filter(p => p.featured).length}
                </h4>
                <p className="text-muted mb-0 small">Destacados</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-primary-mid border-0">
              <div className="card-body text-center py-3">
                <h4 className="text-primary-light mb-1">
                  {new Set(products.map(p => p.sellerId)).size}
                </h4>
                <p className="text-muted mb-0 small">Vendedores Únicos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}