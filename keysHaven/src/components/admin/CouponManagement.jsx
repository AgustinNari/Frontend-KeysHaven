import React, { useState, useEffect } from 'react';
import { createDiscount, getDiscounts, updateDiscount, deleteDiscount, getCategories } from '../../services/adminService';

export default function CouponManagement() {
  const [discounts, setDiscounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    scope: 'CATEGORY',
    targetCategoryId: '',
    minQuantity: '',
    maxQuantity: '',
    startsAt: '',
    endsAt: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [discountsData, categoriesData] = await Promise.all([
        getDiscounts(),
        getCategories()
      ]);
      setDiscounts(discountsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.type === 'PERCENTAGE' ? parseInt(formData.value) : parseFloat(formData.value),
        scope: 'CATEGORY', // Siempre CATEGORY para admin
        targetCategoryId: formData.targetCategoryId ? parseInt(formData.targetCategoryId) : null,
        minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : null,
        maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : null,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
      };

      await createDiscount(payload);
      
      setShowForm(false);
      setFormData({
        code: '',
        type: 'PERCENTAGE',
        value: '',
        scope: 'CATEGORY',
        targetCategoryId: '',
        minQuantity: '',
        maxQuantity: '',
        startsAt: '',
        endsAt: '',
        minPrice: '',
        maxPrice: ''
      });
      
      await loadData(); // Recargar lista
    } catch (err) {
      console.error('Error creando descuento:', err);
      setError(err.response?.data?.message || 'Error al crear descuento');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (discountId, currentStatus) => {
    try {
      await updateDiscount(discountId, { active: !currentStatus });
      await loadData(); // Recargar lista
    } catch (err) {
      console.error('Error actualizando descuento:', err);
      setError('Error al actualizar descuento');
    }
  };

  const handleDelete = async (discountId) => {
    if (!window.confirm('¿Estás seguro de eliminar este descuento?')) return;
    
    try {
      await deleteDiscount(discountId);
      await loadData(); // Recargar lista
    } catch (err) {
      console.error('Error eliminando descuento:', err);
      setError('Error al eliminar descuento');
    }
  };

  // Filtrar solo descuentos de categoría (scope = CATEGORY)
  const categoryDiscounts = discounts.filter(d => d.scope === 'CATEGORY');

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
        <h5 className="text-primary-light mb-0">Descuentos por Categoría</h5>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          <i className="fas fa-plus me-2"></i>
          Nuevo Descuento
        </button>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Formulario de creación */}
        {showForm && (
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-body">
              <h6 className="text-primary-light mb-3">Crear Nuevo Descuento por Categoría</h6>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Código *</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark border-secondary text-white text-uppercase"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      required
                      disabled={loading}
                      placeholder="EJ: RPG25"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Tipo *</label>
                    <select 
                      className="form-select bg-dark border-secondary text-white"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      disabled={loading}
                    >
                      <option value="PERCENTAGE">Porcentaje (%)</option>
                      <option value="FIXED_AMOUNT">Monto Fijo</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">
                      {formData.type === 'PERCENTAGE' ? 'Valor (%) *' : 'Monto *'}
                    </label>
                    <input 
                      type="number" 
                      step={formData.type === 'PERCENTAGE' ? "1" : "0.01"}
                      min="0"
                      max={formData.type === 'PERCENTAGE' ? "100" : undefined}
                      className="form-control bg-dark border-secondary text-white"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Categoría *</label>
                    <select 
                      className="form-select bg-dark border-secondary text-white"
                      value={formData.targetCategoryId}
                      onChange={(e) => setFormData({...formData, targetCategoryId: e.target.value})}
                      required
                      disabled={loading}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.description} ({category.productCount || 0} productos)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Fecha de Inicio</label>
                    <input 
                      type="datetime-local" 
                      className="form-control bg-dark border-secondary text-white"
                      value={formData.startsAt}
                      onChange={(e) => setFormData({...formData, startsAt: e.target.value})}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Fecha de Fin</label>
                    <input 
                      type="datetime-local" 
                      className="form-control bg-dark border-secondary text-white"
                      value={formData.endsAt}
                      onChange={(e) => setFormData({...formData, endsAt: e.target.value})}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Cantidad Mínima</label>
                    <input 
                      type="number" 
                      min="1"
                      className="form-control bg-dark border-secondary text-white"
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({...formData, minQuantity: e.target.value})}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Cantidad Máxima</label>
                    <input 
                      type="number" 
                      min="1"
                      className="form-control bg-dark border-secondary text-white"
                      value={formData.maxQuantity}
                      onChange={(e) => setFormData({...formData, maxQuantity: e.target.value})}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creando...' : 'Crear Descuento'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de descuentos */}
        <div className="table-responsive">
          <table className="table table-dark table-borderless">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descuento</th>
                <th>Categoría</th>
                <th>Válido Hasta</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    Cargando descuentos...
                  </td>
                </tr>
              ) : categoryDiscounts.map(discount => (
                <tr key={discount.id}>
                  <td className="text-primary-light font-monospace">
                    <strong>{discount.code}</strong>
                  </td>
                  <td>
                    {discount.type === 'PERCENTAGE' 
                      ? `${discount.value}%`
                      : `$${discount.value}`
                    }
                  </td>
                  <td>
                    <span className="badge bg-info">
                      {categories.find(c => c.id === discount.targetCategoryId)?.description || 'Categoría no encontrada'}
                    </span>
                  </td>
                  <td className="text-muted">
                    {discount.endsAt ? new Date(discount.endsAt).toLocaleDateString() : 'Sin fecha límite'}
                  </td>
                  <td>
                    <span className={`badge ${discount.active ? 'bg-success' : 'bg-danger'}`}>
                      {discount.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-warning"
                        onClick={() => handleToggleStatus(discount.id, discount.active)}
                        disabled={loading}
                      >
                        {discount.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button 
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(discount.id)}
                        disabled={loading}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && categoryDiscounts.length === 0 && (
            <div className="text-center text-muted py-4">
              No hay descuentos por categoría creados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}