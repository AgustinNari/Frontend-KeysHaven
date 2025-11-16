import React, { useEffect, useState } from 'react';
import { createDiscount, getSellerDiscounts, updateDiscount, getSellerProducts } from '../../services/sellerService';
import ConfirmModal from '../profile/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaginationBar from '../catalog/PaginationBar';

export default function SellerCoupons() {
  const { user } = useAuth();
  const sellerId = user?.id;
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const emptyForm = {
    code: '',
    type: 'PERCENT',
    value: '',
    scope: 'PRODUCT',
    targetProductId: '',
    startsAt: '',
    endsAt: '',
    minQuantity: '',
    maxQuantity: '',
    minPrice: '',
    maxPrice: ''
  };
  const [formData, setFormData] = useState(emptyForm);
  const [confirm, setConfirm] = useState({ show:false, title:'', message:'', onConfirm:null });

  useEffect(() => { loadData(); }, [sellerId, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!sellerId) return;
      const [productsData, couponsData] = await Promise.all([
        getSellerProducts(sellerId),
        getSellerDiscounts(Math.max(0, page - 1), pageSize)
      ]);
      const prods = Array.isArray(productsData) ? productsData : (productsData.content || []);
      setProducts(prods || []);
      setCoupons(couponsData.items || []);
      setTotal(couponsData.total || (Array.isArray(couponsData.items) ? couponsData.items.length : 0));
    } catch (err) {
      console.error(err);
      if (err && err.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (discount) => {
    setEditingId(discount.id);
    setFormData({
      code: discount.code ?? '',
      type: discount.type ?? 'PERCENT',
      value: discount.value !== undefined && discount.value !== null ? String(discount.value) : '',
      scope: discount.scope ?? 'PRODUCT',
      targetProductId: discount.targetProductId ?? '',
      startsAt: discount.startsAt ? new Date(discount.startsAt).toISOString().slice(0,16) : '',
      endsAt: discount.endsAt ? new Date(discount.endsAt).toISOString().slice(0,16) : '',
      minQuantity: discount.minQuantity ?? '',
      maxQuantity: discount.maxQuantity ?? '',
      minPrice: discount.minPrice ?? '',
      maxPrice: discount.maxPrice ?? ''
    });
    setShowForm(true);
  };

  const handleGenerateCode = () => {
    const c = 'CPN' + Math.random().toString(36).substring(2,8).toUpperCase();
    setFormData(d => ({ ...d, code: c }));
  };

  const validateForm = () => {
    setError('');
    if (!formData.startsAt || !formData.endsAt) {
      setError('Fecha de inicio y fecha de fin son obligatorias');
      return false;
    }
    const s = new Date(formData.startsAt);
    const e = new Date(formData.endsAt);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      setError('Fechas inválidas');
      return false;
    }
    if (e <= s) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return false;
    }
    if (formData.value === '' || formData.value === null || isNaN(Number(formData.value))) {
      setError('Valor del descuento es obligatorio y debe ser numérico');
      return false;
    }
    if (formData.minPrice !== '' && formData.maxPrice !== '') {
      const minP = Number(formData.minPrice);
      const maxP = Number(formData.maxPrice);
      if (isNaN(minP) || isNaN(maxP) || minP > maxP) {
        setError('Si se proporcionan precios mínimo y máximo, debe cumplirse minPrice ≤ maxPrice');
        return false;
      }
    }
    if (formData.scope === 'PRODUCT' && !formData.targetProductId) {
      setError('Debe seleccionar un producto objetivo para el alcance PRODUCT');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        code: formData.code ? String(formData.code).toUpperCase() : undefined,
        type: formData.type,
        value: formData.type === 'PERCENT' ? parseInt(formData.value) : parseFloat(formData.value),
        scope: formData.scope,
        targetProductId: formData.scope === 'PRODUCT' ? (formData.targetProductId ? parseInt(formData.targetProductId) : null) : null,
        targetSellerId: formData.scope === 'SELLER' ? sellerId : null,
        targetBuyerId: formData.targetBuyerId ? parseInt(formData.targetBuyerId) : null,
        minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : null,
        maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : null,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString(),
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null
      };

      if (editingId) {
        await updateDiscount(editingId, payload);
      } else {
        await createDiscount(payload);
      }

      await loadData();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      if (err && err.status === 401) {
        setError('No autorizado. Por favor inicia sesión de nuevo.');
        navigate('/login', { replace: true });
        return;
      }
      setError(err.message || 'Error guardando descuento');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRequest = (discountId, currentStatus) => {
    if (currentStatus) {
      setConfirm({
        show: true,
        title: 'Desactivar Descuento/Cupón',
        message: '¿Estás seguro que querés desactivar este descuento/cupón? No se eliminará definitivamente.',
        onConfirm: () => handleDeactivateConfirmed(discountId)
      });
    } else {
      handleActivate(discountId);
    }
  };

  const handleDeactivateConfirmed = async (discountId) => {
    setLoading(true);
    try {
      await updateDiscount(discountId, { active: false });
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Error desactivando descuento');
    } finally {
      setLoading(false);
      setConfirm({ show:false, title:'', message:'', onConfirm:null });
    }
  };

  const handleActivate = async (discountId) => {
    setLoading(true);
    try {
      await updateDiscount(discountId, { active: true });
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Error activando descuento');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
        <h5 className="text-primary-light mb-0">Cupones / Descuentos</h5>
        <div>
          <button className="btn btn-primary me-2" onClick={handleOpenCreate} disabled={loading}><i className="fas fa-plus me-1"></i> Nuevo</button>
          <button className="btn btn-outline-secondary" onClick={loadData} disabled={loading}>Refrescar</button>
        </div>
      </div>

      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}

        {showForm && (
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-body">
              <h6 className="text-primary-light mb-3">{editingId ? 'Editar Descuento/Cupón' : 'Crear Nuevo'}</h6>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label text-primary-light">Tipo *</label>
                    <select className="form-select bg-dark border-secondary text-white" value={formData.type} onChange={(e)=>setFormData({...formData, type:e.target.value})} disabled={loading}>
                      <option value="PERCENT">Porcentaje (%)</option>
                      <option value="FIXED">Monto Fijo (Cupón)</option>
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label text-primary-light">Valor *</label>
                    <input type="number" className="form-control bg-dark border-secondary text-white" value={formData.value} onChange={(e)=>setFormData({...formData, value:e.target.value})} required />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label text-primary-light">Alcance *</label>
                    <select className="form-select bg-dark border-secondary text-white" value={formData.scope} onChange={(e)=>setFormData({...formData, scope:e.target.value})} disabled={loading}>
                      <option value="PRODUCT">Producto específico</option>
                      <option value="SELLER">Todos mis productos</option>
                    </select>
                  </div>

                  {formData.scope === 'PRODUCT' && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-primary-light">Producto objetivo *</label>
                      <select className="form-select bg-dark border-secondary text-white" value={formData.targetProductId} onChange={(e)=>setFormData({...formData, targetProductId:e.target.value})} required>
                        <option value="">Selecciona un producto</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                    </div>
                  )}

                  {formData.type === 'FIXED' && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-primary-light">Código (opcional)</label>
                      <div className="input-group">
                        <input className="form-control bg-dark border-secondary text-white text-uppercase" value={formData.code} onChange={(e)=>setFormData({...formData, code: e.target.value})} />
                        <button type="button" className="btn btn-outline-secondary" onClick={handleGenerateCode}>Generar</button>
                      </div>
                      <small className="text-muted">Si no pones código se generará uno automáticamente.</small>
                    </div>
                  )}

                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Fecha Inicio *</label>
                    <input type="datetime-local" className="form-control bg-dark border-secondary text-white" value={formData.startsAt} onChange={(e)=>setFormData({...formData, startsAt:e.target.value})} required />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Fecha Fin *</label>
                    <input type="datetime-local" className="form-control bg-dark border-secondary text-white" value={formData.endsAt} onChange={(e)=>setFormData({...formData, endsAt:e.target.value})} required />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Precio Mínimo (opcional)</label>
                    <input type="number" step="0.01" className="form-control bg-dark border-secondary text-white" value={formData.minPrice} onChange={(e)=>setFormData({...formData, minPrice: e.target.value})} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Precio Máximo (opcional)</label>
                    <input type="number" step="0.01" className="form-control bg-dark border-secondary text-white" value={formData.maxPrice} onChange={(e)=>setFormData({...formData, maxPrice: e.target.value})} />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>{editingId ? 'Guardar cambios' : 'Crear'}</button>
                  <button type="button" className="btn btn-secondary" onClick={()=>{ setShowForm(false); setEditingId(null); }} disabled={loading}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-dark table-borderless">
            <thead>
              <tr>
                <th>Código</th><th>Tipo</th><th>Valor</th><th>Alcance</th><th>Target</th><th>Válido Hasta</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4 text-muted">Cargando...</td></tr>
              ) : (coupons || []).map(d => (
                <tr key={d.id}>
                  <td className="font-monospace">{d.code || '-'}</td>
                  <td>{d.type}</td>
                  <td>{d.type === 'PERCENT' ? `${d.value}%` : `$${d.value}`}</td>
                  <td>{d.scope}</td>
                  <td>{d.scope === 'PRODUCT' ? (products.find(p => p.id === d.targetProductId)?.title || `#${d.targetProductId}`) : 'Mi tienda'}</td>
                  <td>{d.endsAt ? new Date(d.endsAt).toLocaleString() : 'Sin límite'}</td>
                  <td><span className={`badge ${d.active ? 'bg-success' : 'bg-danger'}`}>{d.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-warning" onClick={()=>handleEdit(d)} disabled={loading}>Editar</button>
                      <button className="btn btn-outline-secondary" onClick={()=>handleToggleRequest(d.id, d.active)} disabled={loading}>{d.active ? 'Desactivar' : 'Activar'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && (coupons || []).length === 0 && <div className="text-center text-muted py-4">No hay descuentos/cupons creados.</div>}
        </div>

        <div className="d-flex justify-content-center mt-3">
          <PaginationBar page={page} setPage={setPage} totalPages={totalPages} />
        </div>

        <ConfirmModal show={confirm.show} title={confirm.title} message={confirm.message} onConfirm={() => { confirm.onConfirm && confirm.onConfirm(); }} onCancel={() => setConfirm({ show:false, title:'', message:'', onConfirm:null })} confirmText="Desactivar" cancelText="Cancelar" />
      </div>
    </div>
  );
}
