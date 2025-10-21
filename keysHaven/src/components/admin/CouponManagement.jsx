import React, { useState, useEffect } from 'react';
import { createDiscount, getDiscounts, updateDiscount, getCategories, getUsers } from '../../services/adminService';
import ConfirmModal from '../profile/ConfirmModal';

export default function CouponManagement() {
  const [discounts, setDiscounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    code: '',
    type: 'PERCENT',
    value: '',
    scope: 'CATEGORY',
    targetCategoryId: '',
    targetBuyerId: '',
    minQuantity: '',
    maxQuantity: '',
    startsAt: '',
    endsAt: '',
    minPrice: '',
    maxPrice: ''
  };
  const [formData, setFormData] = useState(emptyForm);

  const [confirm, setConfirm] = useState({ show:false, title:'', message:'', onConfirm:null });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [discountsData = [], categoriesData = [], usersData = []] = await Promise.all([
        getDiscounts(),
        getCategories(),
        getUsers()
      ]);
      setDiscounts(discountsData || []);
      setCategories(categoriesData || []);
      setUsers((usersData || []).filter(u => u.role === 'BUYER'));
    } catch (err) {
      console.error(err);
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const closeConfirm = () => setConfirm({ show:false, title:'', message:'', onConfirm:null });

  const handleOpenCreate = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (discount) => {
    setEditingId(discount.id);
    setFormData({
      code: discount.code ?? '',
      type: discount.type,
      value: discount.value ?? '',
      scope: discount.scope ?? 'CATEGORY',
      targetCategoryId: discount.targetCategoryId ?? '',
      targetBuyerId: discount.targetBuyerId ?? '',
      minQuantity: discount.minQuantity ?? '',
      maxQuantity: discount.maxQuantity ?? '',
      startsAt: discount.startsAt ? new Date(discount.startsAt).toISOString().slice(0,16) : '',
      endsAt: discount.endsAt ? new Date(discount.endsAt).toISOString().slice(0,16) : '',
      minPrice: discount.minPrice ?? '',
      maxPrice: discount.maxPrice ?? ''
    });
    setShowForm(true);
  };

  const handleGenerateCode = () => {
    const c = 'CPN' + Math.random().toString(36).substring(2,8).toUpperCase();
    setFormData(d => ({ ...d, code: c }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        code: formData.code ? String(formData.code).toUpperCase() : undefined,
        type: formData.type,
        value: formData.type === 'PERCENT' ? parseInt(formData.value) : parseFloat(formData.value),
        scope: 'CATEGORY',
        targetCategoryId: formData.targetCategoryId ? parseInt(formData.targetCategoryId) : null,
        targetBuyerId: formData.type === 'FIXED' ? (formData.targetBuyerId ? parseInt(formData.targetBuyerId) : null) : null,
        minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : null,
        maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : null,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
      };

      if (editingId) {
        await updateDiscount(editingId, payload);
      } else {
        await createDiscount(payload);
      }

      await loadData();
      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
    } catch (err) {
      console.error(err);
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
      closeConfirm();
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

  const categoryDiscounts = discounts.filter(d => d.scope === 'CATEGORY');

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
        <h5 className="text-primary-light mb-0">Cupones / Descuentos por Categoría</h5>
        <div>
          <button className="btn btn-primary me-2" onClick={handleOpenCreate} disabled={loading}>
            <i className="fas fa-plus me-1"></i> Nuevo
          </button>
          <button className="btn btn-outline-secondary" onClick={loadData} disabled={loading}>
            Refrescar
          </button>
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
                    <input type="number" className="form-control bg-dark border-secondary text-white"
                      value={formData.value}
                      onChange={(e)=>setFormData({...formData, value:e.target.value})}
                      required />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label text-primary-light">Categoría *</label>
                    <select className="form-select bg-dark border-secondary text-white" value={formData.targetCategoryId} onChange={(e)=>setFormData({...formData, targetCategoryId:e.target.value})} required>
                      <option value="">Selecciona una categoría</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.description}</option>)}
                    </select>
                  </div>

                  {formData.type === 'FIXED' && (
                    <>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-primary-light">Código (opcional)</label>
                        <div className="input-group">
                          <input className="form-control bg-dark border-secondary text-white text-uppercase" value={formData.code} onChange={(e)=>setFormData({...formData, code: e.target.value})} />
                          <button type="button" className="btn btn-outline-secondary" onClick={handleGenerateCode}>Generar</button>
                        </div>
                        <small className="text-muted">Si no pones código se generará uno automáticamente.</small>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label text-primary-light">Asignar a comprador *</label>
                        <select className="form-select bg-dark border-secondary text-white" value={formData.targetBuyerId} onChange={(e)=>setFormData({...formData, targetBuyerId: e.target.value})} required>
                          <option value="">Selecciona un comprador</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.displayName || u.email}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Fecha Inicio</label>
                    <input type="datetime-local" className="form-control bg-dark border-secondary text-white" value={formData.startsAt} onChange={(e)=>setFormData({...formData, startsAt:e.target.value})} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Fecha Fin</label>
                    <input type="datetime-local" className="form-control bg-dark border-secondary text-white" value={formData.endsAt} onChange={(e)=>setFormData({...formData, endsAt:e.target.value})} />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>{editingId ? 'Guardar cambios' : 'Crear'}</button>
                  <button type="button" className="btn btn-secondary" onClick={()=>{ setShowForm(false); setEditingId(null); setFormData(emptyForm); }} disabled={loading}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-dark table-borderless">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Categoría</th>
                <th>Target</th>
                <th>Válido Hasta</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4 text-muted">Cargando...</td></tr>
              ) : categoryDiscounts.map(d => (
                <tr key={d.id}>
                  <td className="font-monospace">{d.code || '-'}</td>
                  <td>{d.type}</td>
                  <td>{d.type === 'PERCENT' ? `${d.value}%` : `$${d.value}`}</td>
                  <td>{categories.find(c => c.id === d.targetCategoryId)?.description || '—'}</td>
                  <td>{d.type === 'FIXED' ? (users.find(u => u.id === d.targetBuyerId)?.displayName || d.targetBuyerId) : 'Global'}</td>
                  <td>{d.endsAt ? new Date(d.endsAt).toLocaleString() : 'Sin límite'}</td>
                  <td><span className={`badge ${d.active ? 'bg-success' : 'bg-danger'}`}>{d.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-warning" onClick={()=>handleEdit(d)} disabled={loading}>Editar</button>
                      <button className="btn btn-outline-secondary" onClick={()=>handleToggleRequest(d.id, d.active)} disabled={loading}>
                        {d.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && categoryDiscounts.length === 0 && <div className="text-center text-muted py-4">No hay descuentos/cupons por categoría.</div>}
        </div>

        <ConfirmModal
          show={confirm.show}
          title={confirm.title}
          message={confirm.message}
          onConfirm={() => { confirm.onConfirm && confirm.onConfirm(); }}
          onCancel={closeConfirm}
          confirmText="Desactivar"
          cancelText="Cancelar"
        />
      </div>
    </div>
  );
}
