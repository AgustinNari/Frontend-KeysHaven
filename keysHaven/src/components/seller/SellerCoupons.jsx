import React, { useEffect, useState } from 'react';
import { createDiscount, getSellerDiscounts, updateDiscount, getSellerProducts } from '../../services/sellerService';
import { mockUsers } from '../../data/mockData';
import ConfirmModal from '../profile/ConfirmModal';

export default function SellerCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENT',     // 'PERCENT' | 'FIXED'
    value: '',
    scope: 'PRODUCT',    // 'PRODUCT' | 'SELLER'
    targetProductId: '',
    targetBuyerId: '',
    startsAt: '',
    endsAt: '',
    minQuantity: '',
    maxQuantity: '',
    minPrice: '',
    maxPrice: ''
  });

  const [products, setProducts] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState({ show:false, title:'', message:'', onConfirm:null });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, couponsData] = await Promise.all([ getSellerProducts(), getSellerDiscounts() ]);
      setProducts(productsData || []);
      setCoupons(couponsData || []);
      const b = (mockUsers || []).filter(u => u.role === 'BUYER');
      setBuyers(b);
    } catch (err) {
      console.error(err);
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      code: '',
      type: 'PERCENT',
      value: '',
      scope: 'PRODUCT',
      targetProductId: '',
      targetBuyerId: '',
      startsAt: '',
      endsAt: '',
      minQuantity: '',
      maxQuantity: '',
      minPrice: '',
      maxPrice: ''
    });
    setShowForm(true);
  };

  const openEdit = (coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code || '',
      type: coupon.type || 'PERCENT',
      value: coupon.value !== undefined && coupon.value !== null ? String(coupon.value) : '',
      scope: coupon.scope || 'PRODUCT',
      targetProductId: coupon.targetProductId || '',
      targetBuyerId: coupon.targetBuyerId || '',
      startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().slice(0,16) : '',
      endsAt: coupon.endsAt ? new Date(coupon.endsAt).toISOString().slice(0,16) : '',
      minQuantity: coupon.minQuantity ?? '',
      maxQuantity: coupon.maxQuantity ?? '',
      minPrice: coupon.minPrice ?? '',
      maxPrice: coupon.maxPrice ?? ''
    });
    setShowForm(true);
  };

  const handleGenerateCode = () => {
    const c = 'CPN' + Math.random().toString(36).substring(2,8).toUpperCase();
    setFormData(d => ({ ...d, code: c }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        code: formData.code ? String(formData.code).toUpperCase() : undefined,
        type: formData.type, // 'PERCENT'|'FIXED'
        value: formData.type === 'PERCENT' ? Number(formData.value) : Number(formData.value),
        scope: formData.scope,
        targetProductId: formData.scope === 'PRODUCT' ? (formData.targetProductId ? Number(formData.targetProductId) : null) : null,
        targetSellerId: formData.scope === 'SELLER' ? undefined : undefined,
        targetBuyerId: formData.type === 'FIXED' ? (formData.targetBuyerId ? Number(formData.targetBuyerId) : undefined) : null,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
        minQuantity: formData.minQuantity ? Number(formData.minQuantity) : null,
        maxQuantity: formData.maxQuantity ? Number(formData.maxQuantity) : null,
        minPrice: formData.minPrice ? Number(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? Number(formData.maxPrice) : null
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
      setError(err.message || 'Error al guardar descuento');
    } finally {
      setLoading(false);
    }
  };

  const requestToggleStatus = (coupon) => {
    if (coupon.active) {
      setConfirm({
        show: true,
        title: 'Desactivar cupón',
        message: `¿Desactivar "${coupon.code || '(sin código)'}"? Puedes reactivarlo luego.`,
        onConfirm: async () => {
          await doToggleStatus(coupon);
          setConfirm(c => ({ ...c, show:false }));
        }
      });
    } else {
      doToggleStatus(coupon);
    }
  };

  const doToggleStatus = async (coupon) => {
    setLoading(true);
    try {
      await updateDiscount(coupon.id, { active: !coupon.active });
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Error actualizando estado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
        <h5 className="text-primary-light mb-0">Cupones y Descuentos</h5>
        <div>
          <button className="btn btn-primary me-2" onClick={openCreate} disabled={loading}><i className="fas fa-plus me-1"></i>Nuevo</button>
          <button className="btn btn-outline-secondary" onClick={loadData} disabled={loading}>Refrescar</button>
        </div>
      </div>

      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}

        {showForm && (
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-body">
              <h6 className="text-primary-light mb-3">{editingId ? 'Editar Descuento / Cupón' : 'Crear Nuevo'}</h6>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label text-primary-light">Tipo *</label>
                    <select className="form-select bg-dark border-secondary text-white" value={formData.type} onChange={(e)=>setFormData({...formData, type: e.target.value})} disabled={loading}>
                      <option value="PERCENT">Porcentaje (%)</option>
                      <option value="FIXED">Monto fijo (Cupón)</option>
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label text-primary-light">Valor *</label>
                    <input type="number" step={formData.type === 'PERCENT' ? "1" : "0.01"} min="0" max={formData.type === 'PERCENT' ? "100" : undefined}
                      className="form-control bg-dark border-secondary text-white" value={formData.value} onChange={(e)=>setFormData({...formData, value: e.target.value})} required />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label text-primary-light">Alcance *</label>
                    <select className="form-select bg-dark border-secondary text-white" value={formData.scope} onChange={(e)=>setFormData({...formData, scope: e.target.value})} disabled={loading}>
                      <option value="PRODUCT">Producto específico</option>
                      <option value="SELLER">Todos mis productos</option>
                    </select>
                  </div>

                  {formData.scope === 'PRODUCT' && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-primary-light">Producto objetivo *</label>
                      <select className="form-select bg-dark border-secondary text-white" value={formData.targetProductId} onChange={(e)=>setFormData({...formData, targetProductId: e.target.value})} required>
                        <option value="">Selecciona un producto</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                    </div>
                  )}

                  {formData.type === 'FIXED' && (
                    <>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-primary-light">Código (opcional)</label>
                        <div className="input-group">
                          <input className="form-control bg-dark border-secondary text-white text-uppercase" value={formData.code} onChange={(e)=>setFormData({...formData, code: e.target.value})} />
                          <button type="button" className="btn btn-outline-secondary" onClick={handleGenerateCode}>Generar</button>
                        </div>
                        <small className="text-muted">Si no pones código se generará automáticamente al guardar.</small>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label text-primary-light">Asignar a comprador (destino del cupón) *</label>
                        <select className="form-select bg-dark border-secondary text-white" value={formData.targetBuyerId} onChange={(e)=>setFormData({...formData, targetBuyerId: e.target.value})} required>
                          <option value="">Selecciona un comprador</option>
                          {buyers.map(b => <option key={b.id} value={b.id}>{b.displayName || b.email}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Fecha Inicio</label>
                    <input type="datetime-local" className="form-control bg-dark border-secondary text-white" value={formData.startsAt} onChange={(e)=>setFormData({...formData, startsAt: e.target.value})} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Fecha Fin</label>
                    <input type="datetime-local" className="form-control bg-dark border-secondary text-white" value={formData.endsAt} onChange={(e)=>setFormData({...formData, endsAt: e.target.value})} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Cantidad mínima (opcional)</label>
                    <input type="number" min="1" className="form-control bg-dark border-secondary text-white" value={formData.minQuantity} onChange={(e)=>setFormData({...formData, minQuantity: e.target.value})} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Cantidad máxima (opcional)</label>
                    <input type="number" min="1" className="form-control bg-dark border-secondary text-white" value={formData.maxQuantity} onChange={(e)=>setFormData({...formData, maxQuantity: e.target.value})} />
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
                <th>Código</th><th>Descuento</th><th>Alcance</th><th>Target</th><th>Válido Hasta</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id}>
                  <td className="font-monospace">{c.code || '-'}</td>
                  <td>{c.type === 'PERCENT' ? `${c.value}%` : `$${c.value}`}</td>
                  <td>{c.scope === 'PRODUCT' ? 'Producto' : 'Todos mis productos'}</td>
                  <td>{c.scope === 'PRODUCT' ? (products.find(p => p.id === c.targetProductId)?.title || `#${c.targetProductId}`) : 'Mi tienda'}</td>
                  <td>{c.endsAt ? new Date(c.endsAt).toLocaleString() : 'Sin límite'}</td>
                  <td><span className={`badge ${c.active ? 'bg-success' : 'bg-danger'}`}>{c.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary" onClick={()=>openEdit(c)}>Editar</button>
                      <button className="btn btn-outline-secondary" onClick={()=>requestToggleStatus(c)}>{c.active ? 'Desactivar' : 'Activar'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && coupons.length === 0 && <div className="text-center text-muted py-4">No hay cupones o descuentos creados.</div>}
        </div>
      </div>

      <ConfirmModal show={confirm.show} title={confirm.title} message={confirm.message} onConfirm={()=>{ confirm.onConfirm && confirm.onConfirm(); }} onCancel={()=>setConfirm({...confirm, show:false})} confirmText="Confirmar" cancelText="Cancelar" />
    </div>
  );
}
