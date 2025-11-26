import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import ConfirmModal from '../profile/ConfirmModal';
import PaginationBar from '../catalog/PaginationBar';

import {
  fetchProductsPage as fetchAdminProductsPage,
  adminUpdateProduct,
  setProductsPageFromCache
} from '../../redux/slices/adminPanelSlice';
import { upsertProductInList } from '../../redux/slices/productsSlice';
import { upsertProductDetail } from '../../redux/slices/productDetailSlice';

export default function ProductManagement() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector(state => state.adminPanel);
  const productsPage = admin?.productsPage ?? null;
  const products = productsPage?.content ?? [];

  const [loadingLocal, setLoadingLocal] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const [confirm, setConfirm] = useState({ show: false, title: '', message: '', onConfirm: null });

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, productsPage?.totalPages ?? 1);


  const pageKey = `${Math.max(1, Number(page) || 1)}_${pageSize}`;

  useEffect(() => {

    if (admin?.productsPageCache?.[pageKey]) {
      dispatch(setProductsPageFromCache({ key: pageKey }));
      return;
    }

    loadProducts(Math.max(1, Number(page) || 1));

  }, [page, dispatch, pageKey]);

  const loadProducts = async (p = 1) => {
    setLoadingLocal(true);
    setError('');
    try {
      await dispatch(fetchAdminProductsPage({ page: p, size: pageSize })).unwrap();
    } catch (err) {
      console.error('Error cargando productos:', err);
      if (err && err.status === 401) {
        setError('No autorizado. Iniciá sesión.');
      } else if (err && err.status === 403) {
        setError('Acceso denegado.');
      } else {
        setError('Error al cargar productos (revisá que el API_BASE sea correcto)');
      }
    } finally {
      setLoadingLocal(false);
    }
  };

  const closeConfirm = () => setConfirm({ show: false, title: '', message: '', onConfirm: null });

  const handleToggleRequest = (product) => {
    if (product.active) {
      setConfirm({
        show: true,
        title: 'Desactivar Producto',
        message: `¿Estás seguro que querés desactivar el producto "${product.title}"? Podrás activarlo luego.`,
        onConfirm: () => handleDeactivateConfirmed(product.id)
      });
    } else {
      handleActivate(product.id);
    }
  };

  const handleDeactivateConfirmed = async (productId) => {
    setActionLoading(`status-${productId}`);
    try {
      const result = await dispatch(adminUpdateProduct({ productId, productData: { active: false } })).unwrap();
      dispatch(upsertProductInList(result));
      dispatch(upsertProductDetail(result));
    } catch (err) {
      console.error('Error desactivando producto:', err);
      setError('Error al desactivar producto');
    } finally {
      setActionLoading(null);
      closeConfirm();
    }
  };

  const handleActivate = async (productId) => {
    setActionLoading(`status-${productId}`);
    try {
      const result = await dispatch(adminUpdateProduct({ productId, productData: { active: true } })).unwrap();
      dispatch(upsertProductInList(result));
      dispatch(upsertProductDetail(result));
    } catch (err) {
      console.error('Error activando producto:', err);
      setError('Error al activar producto');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (product) => {
    setActionLoading(`featured-${product.id}`);
    const originalFeatured = product.featured;
    try {
      const result = await dispatch(adminUpdateProduct({ productId: product.id, productData: { featured: !originalFeatured } })).unwrap();
      dispatch(upsertProductInList(result));
      dispatch(upsertProductDetail(result));
    } catch (err) {
      console.error('Error actualizando producto:', err);
      setError('Error al actualizar producto');
    } finally {
      setActionLoading(null);
    }
  };

  const deriveAvailableStock = (product) => {
    if (!product) return 0;
    const candidates = [product.availableStock, product.available_stock, product.available_stock_count, product.available, product.stock, product.availableQuantity, product.available_quantity, product.availableQty, product.available_qty, product.quantity, product.qty];
    for (const c of candidates) {
      if (typeof c === 'number' && !Number.isNaN(c)) return c;
      if (typeof c === 'string' && c.trim() !== '' && !Number.isNaN(Number(c))) return Number(c);
    }
    try {
      if (product.inventory && typeof product.inventory === 'object') {
        const inv = product.inventory;
        const invCandidates = [inv.available, inv.availableStock, inv.stock, inv.qty, inv.quantity];
        for (const ic of invCandidates) {
          if (typeof ic === 'number' && !Number.isNaN(ic)) return ic;
          if (typeof ic === 'string' && ic.trim() !== '' && !Number.isNaN(Number(ic))) return Number(ic);
        }
      }
    } catch (e) {}
    return 0;
  };

  const resolvePrimaryImage = (product) => {
    if (!product) return null;
    if (product.primaryImageDataUrl) return product.primaryImageDataUrl;
    if (product.primaryImageUrl) return product.primaryImageUrl;
    if (product.imageUrls && product.imageUrls.length > 0) return product.imageUrls[0];
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const primary = product.images.find(i => i.isPrimary);
      const candidate = primary?.url ?? product.images[0]?.url ?? product.images[0]?.dataUrl ?? null;
      if (candidate) return candidate;
    }
    return null;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.title?.toLowerCase().includes(searchTerm.toLowerCase()) || (product.sellerDisplayName || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? product.active : !product.active);
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
        <h5 className="text-primary-light mb-0"><i className="fas fa-gamepad me-2"></i> Gestión Global de Productos</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Filtros y Búsqueda */}
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label text-primary-light"><i className="fas fa-search me-1"></i> Buscar</label>
            <input type="text" className="form-control bg-dark border-secondary text-white" placeholder="Nombre del producto o vendedor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label text-primary-light"><i className="fas fa-filter me-1"></i> Estado</label>
            <select className="form-select bg-dark border-secondary text-white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
              <i className="fas fa-eraser me-1"></i> Limpiar
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-borderless">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Vendedor</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Destacado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loadingLocal ? (
                <tr><td colSpan="7" className="text-center text-muted py-4"><div className="spinner-border spinner-border-sm me-2" role="status"></div> Cargando productos...</td></tr>
              ) : filteredProducts.map(product => {
                const availableStock = deriveAvailableStock(product);
                const stockStatus = getStockStatus(availableStock);
                const isStatusLoading = actionLoading === `status-${product.id}`;
                const isFeaturedLoading = actionLoading === `featured-${product.id}`;
                const thumb = resolvePrimaryImage(product);

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {thumb && <img src={thumb} alt={product.title} className="rounded me-3" style={{ width: '50px', height: '50px', objectFit: 'cover' }} loading="lazy" onError={(e)=>{e.target.src='https://via.placeholder.com/50x50/333/666?text=Imagen'}} />}
                        <div><div className="text-primary-light fw-bold">{product.title}</div><small className="text-muted">{product.platform} • {product.region}</small></div>
                      </div>
                    </td>
                    <td><div className="text-white">{product.sellerDisplayName}</div><small className="text-muted">ID: {product.sellerId}</small></td>
                    <td><div className="text-primary-light fw-bold">USD {product.price}</div></td>
                    <td><span className={`badge ${stockStatus.class}`}>{availableStock} - {stockStatus.text}</span></td>
                    <td><span className={`badge ${product.active ? 'bg-success' : 'bg-danger'}`}>{product.active ? 'Activo' : 'Inactivo'}</span></td>
                    <td><span className={`badge ${product.featured ? 'bg-warning' : 'bg-secondary'}`}>{product.featured ? 'Sí' : 'No'}</span></td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-warning" onClick={() => handleToggleFeatured(product)} title={product.featured ? 'Quitar destacado' : 'Destacar'} disabled={isFeaturedLoading}>{isFeaturedLoading ? <div className="spinner-border spinner-border-sm" role="status" /> : <i className={`fas fa-star ${product.featured ? 'text-warning' : ''}`}></i>}</button>
                        <button className="btn btn-outline-secondary" onClick={() => handleToggleRequest(product)} title={product.active ? 'Desactivar' : 'Activar'} disabled={isStatusLoading}>{isStatusLoading ? <div className="spinner-border spinner-border-sm" role="status" /> : <i className={`fas ${product.active ? 'fa-eye-slash' : 'fa-eye'}`}></i>}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loadingLocal && filteredProducts.length === 0 && <div className="text-center text-muted py-4"><i className="fas fa-search fa-2x mb-3"></i><p>No se encontraron productos que coincidan con los filtros</p></div>}
        </div>

        <div className="d-flex justify-content-center mt-3"><PaginationBar page={page} setPage={setPage} totalPages={totalPages} /></div>

        <div className="row mt-4">
          <div className="col-md-3"><div className="card bg-primary-mid border-0"><div className="card-body text-center py-3"><h4 className="text-primary-light mb-1">{products.length}</h4><p className="text-muted mb-0 small">Total Productos (página)</p></div></div></div>
          <div className="col-md-3"><div className="card bg-primary-mid border-0"><div className="card-body text-center py-3"><h4 className="text-primary-light mb-1">{products.filter(p => p.active).length}</h4><p className="text-muted mb-0 small">Productos Activos (página)</p></div></div></div>
          <div className="col-md-3"><div className="card bg-primary-mid border-0"><div className="card-body text-center py-3"><h4 className="text-primary-light mb-1">{products.filter(p => p.featured).length}</h4><p className="text-muted mb-0 small">Destacados (página)</p></div></div></div>
          <div className="col-md-3"><div className="card bg-primary-mid border-0"><div className="card-body text-center py-3"><h4 className="text-primary-light mb-1">{new Set(products.map(p => p.sellerId)).size}</h4><p className="text-muted mb-0 small">Vendedores Únicos (página)</p></div></div></div>
        </div>

        <ConfirmModal show={confirm.show} title={confirm.title} message={confirm.message} onConfirm={() => { confirm.onConfirm && confirm.onConfirm(); }} onCancel={closeConfirm} confirmText="Desactivar" cancelText="Cancelar" />
      </div>
    </div>
  );
}
