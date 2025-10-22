import React, { useState, useEffect } from 'react';
import { getSellerProducts, getProductDetail, updateProduct } from '../../services/sellerService';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../profile/ConfirmModal';

export default function ProductList({ onEditProduct }) {
  const { user } = useAuth();
  const sellerId = user?.id;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirm, setConfirm] = useState({ show:false, title:'', message:'', onConfirm:null });

  useEffect(() => { loadProducts(); }, [sellerId]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      if (!sellerId) { setProducts([]); setLoading(false); return; }
      const data = await getSellerProducts(sellerId);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Error cargando productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const closeConfirm = () => setConfirm({ show:false, title:'', message:'', onConfirm:null });

  const requestToggleStatus = (product) => {
    if (product.active) {
      setConfirm({
        show: true,
        title: 'Desactivar Producto',
        message: `¿Desactivar "${product.title}"? Podrás activarlo luego.`,
        onConfirm: async () => { await handleToggleConfirmed(product); closeConfirm(); }
      });
    } else {
      handleToggleConfirmed(product);
    }
  };

  const handleToggleConfirmed = async (product) => {
    setLoading(true);
    try {
      await updateProduct(product.id, { active: !product.active });
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError('Error actualizando producto');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (prod) => {
    setLoading(true);
    setError('');
    try {
      const detail = await getProductDetail(prod.id);
      if (!detail) {
        setError('No se pudo obtener el detalle del producto');
        setLoading(false);
        return;
      }
      onEditProduct(detail);
    } catch (err) {
      console.error("Error fetching product detail:", err);
      setError('Error cargando detalle del producto');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return p.active;
    return !p.active;
  });

  const getStockStatus = (stock) => stock > 10 ? { class:'bg-success', text:'En stock' } : stock > 0 ? { class:'bg-warning', text:'Stock bajo' } : { class:'bg-danger', text:'Sin stock' };

  if (loading) {
    return <div className="text-center text-muted py-5"><div className="spinner-border" role="status"></div><div className="mt-2">Cargando productos...</div></div>;
  }

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
        <h5 className="text-primary-light mb-0">Mis Productos</h5>
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm bg-dark border-secondary text-white" style={{width:'150px'}} value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => onEditProduct(null)}><i className="fas fa-plus me-1"></i>Nuevo</button>
        </div>
      </div>

      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="table-responsive">
          <table className="table table-dark table-borderless mb-0">
            <thead>
              <tr>
                <th>Producto</th><th>Precio</th><th>Stock</th><th>Categorías</th><th>Estado</th><th>Destacado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => {
                const thumb = (product.primaryImageDataUrl) ? product.primaryImageDataUrl : (product.imageUrls && product.imageUrls.length>0 ? product.imageUrls[0] : null);
                const stockStatus = getStockStatus(product.availableStock || 0);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {thumb && <img src={thumb} alt={product.title} style={{width:50,height:50,objectFit:'cover'}} className="rounded me-3" onError={(e)=>{ e.target.src='https://via.placeholder.com/50x50/333/666?text=--'; }} />}
                        <div>
                          <div className="text-primary-light fw-bold">{product.title}</div>
                          <small className="text-muted">{product.platform} • {product.region}</small>
                        </div>
                      </div>
                    </td>
                    <td><div className="text-primary-light fw-bold">{product.currency} {product.price}</div></td>
                    <td><span className={`badge ${stockStatus.class}`}>{product.availableStock || 0} - {stockStatus.text}</span></td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {product.categories && product.categories.slice(0,2).map(c => <span key={c.id} className="badge bg-secondary small">{c.description || c.id}</span>)}
                        {product.categories && product.categories.length > 2 && <span className="badge bg-secondary small">+{product.categories.length-2}</span>}
                      </div>
                    </td>
                    <td><span className={`badge ${product.active ? 'bg-success' : 'bg-danger'}`}>{product.active ? 'Activo' : 'Inactivo'}</span></td>
                    <td><span className={`badge ${product.featured ? 'bg-warning' : 'bg-secondary'}`}>{product.featured ? 'Sí' : 'No'}</span></td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => handleEditClick(product)} title="Editar producto"><i className="fas fa-edit"></i></button>
                        <button className="btn btn-outline-warning" onClick={()=> requestToggleStatus(product) } title={product.active ? 'Desactivar' : 'Activar'}><i className={`fas ${product.active ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && <div className="text-center text-muted py-5">{products.length===0 ? (
          <div><i className="fas fa-box fa-3x mb-3"></i><h5>No tienes productos</h5><p>Agrega tu primer producto</p><button className="btn btn-primary" onClick={()=>onEditProduct(null)}><i className="fas fa-plus me-2"></i>Crear</button></div>
        ) : (<div><i className="fas fa-filter fa-3x mb-3"></i><h5>No hay productos con los filtros</h5><button className="btn btn-outline-primary" onClick={()=>setStatusFilter('all')}>Mostrar todos</button></div>)}</div>}
      </div>

      <ConfirmModal show={confirm.show} title={confirm.title} message={confirm.message} onConfirm={()=>{ confirm.onConfirm && confirm.onConfirm(); }} onCancel={closeConfirm} confirmText="Desactivar" cancelText="Cancelar" />
    </div>
  );
}
