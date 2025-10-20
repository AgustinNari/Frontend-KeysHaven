import React, { useState, useEffect } from 'react';
import { getSellerProducts, updateProduct, deleteProduct } from '../../services/sellerService';

export default function ProductList({ onEditProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await getSellerProducts();
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

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await deleteProduct(productId);
      await loadProducts(); // Recargar lista
    } catch (err) {
      console.error('Error eliminando producto:', err);
      setError('Error al eliminar producto');
    }
  };

  const filteredProducts = products.filter(product => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return product.active;
    if (statusFilter === 'inactive') return !product.active;
    return true;
  });

  const getStockStatus = (stock) => {
    if (stock > 10) return { class: 'bg-success', text: 'En stock' };
    if (stock > 0) return { class: 'bg-warning', text: 'Stock bajo' };
    return { class: 'bg-danger', text: 'Sin stock' };
  };

  if (loading) {
    return (
      <div className="text-center text-muted py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <div className="mt-2">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
        <h5 className="text-primary-light mb-0">Mis Productos</h5>
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm bg-dark border-secondary text-white"
            style={{width: '150px'}}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onEditProduct(null)}
          >
            <i className="fas fa-plus me-1"></i>
            Nuevo
          </button>
        </div>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-dark table-borderless mb-0">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categorías</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const stockStatus = getStockStatus(product.availableStock);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {product.imageUrls && product.imageUrls.length > 0 && (
                          <img 
                            src={product.imageUrls[0]} 
                            alt={product.title}
                            className="rounded me-3"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <div className="text-primary-light fw-bold">{product.title}</div>
                          <small className="text-muted">{product.platform} • {product.region}</small>
                          {product.metacriticScore && (
                            <div className="mt-1">
                              <span className="badge bg-metacritic">
                                Metacritic: {product.metacriticScore}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-primary-light fw-bold">
                        {product.currency} {product.price}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <small className="text-muted text-decoration-line-through">
                          {product.currency} {product.originalPrice}
                        </small>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${stockStatus.class}`}>
                        {product.availableStock} - {stockStatus.text}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {product.categories && Array.from(product.categories).slice(0, 2).map(category => (
                          <span key={category.id} className="badge bg-secondary small">
                            {category.description}
                          </span>
                        ))}
                        {product.categories && product.categories.size > 2 && (
                          <span className="badge bg-secondary small">
                            +{product.categories.size - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${product.active ? 'bg-success' : 'bg-danger'}`}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => onEditProduct(product)}
                          title="Editar producto"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-outline-warning"
                          onClick={() => handleToggleStatus(product)}
                          title={product.active ? 'Desactivar' : 'Activar'}
                        >
                          <i className={`fas ${product.active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(product.id)}
                          title="Eliminar producto"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center text-muted py-5">
              {products.length === 0 ? (
                <div>
                  <i className="fas fa-box fa-3x mb-3"></i>
                  <h5>No tienes productos</h5>
                  <p className="mb-3">Comienza agregando tu primer producto a la tienda</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => onEditProduct(null)}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Crear Primer Producto
                  </button>
                </div>
              ) : (
                <div>
                  <i className="fas fa-filter fa-3x mb-3"></i>
                  <h5>No hay productos con los filtros seleccionados</h5>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setStatusFilter('all')}
                  >
                    Mostrar todos los productos
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resumen */}
        {products.length > 0 && (
          <div className="row mt-4">
            <div className="col-md-3">
              <div className="card bg-primary-mid border-0">
                <div className="card-body text-center py-2">
                  <h6 className="text-primary-light mb-1">{products.length}</h6>
                  <small className="text-muted">Total Productos</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-primary-mid border-0">
                <div className="card-body text-center py-2">
                  <h6 className="text-primary-light mb-1">
                    {products.filter(p => p.active).length}
                  </h6>
                  <small className="text-muted">Activos</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-primary-mid border-0">
                <div className="card-body text-center py-2">
                  <h6 className="text-primary-light mb-1">
                    {products.filter(p => p.availableStock > 0).length}
                  </h6>
                  <small className="text-muted">Con Stock</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-primary-mid border-0">
                <div className="card-body text-center py-2">
                  <h6 className="text-primary-light mb-1">
                    {products.filter(p => p.featured).length}
                  </h6>
                  <small className="text-muted">Destacados</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}