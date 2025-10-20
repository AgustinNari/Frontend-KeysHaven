import React, { useState, useEffect } from 'react';
import { createDiscount, getSellerDiscounts, updateDiscount, getSellerProducts } from '../../services/sellerService';

export default function SellerCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    scope: 'PRODUCT',
    targetProductId: '',
    minQuantity: '',
    maxQuantity: '',
    startsAt: '',
    endsAt: '',
    minPrice: '',
    maxPrice: ''
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar productos y cupones existentes
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, couponsData] = await Promise.all([
        getSellerProducts(),
        getSellerDiscounts()
      ]);
      setProducts(productsData);
      setCoupons(couponsData);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar datos');
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
        scope: formData.scope,
        targetProductId: formData.targetProductId ? parseInt(formData.targetProductId) : null,
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
        scope: 'PRODUCT',
        targetProductId: '',
        minQuantity: '',
        maxQuantity: '',
        startsAt: '',
        endsAt: '',
        minPrice: '',
        maxPrice: ''
      });
      
      await loadData(); // Recargar lista
    } catch (err) {
      console.error('Error creando cupón:', err);
      setError(err.response?.data?.message || 'Error al crear cupón');
    } finally {
      setLoading(false);
    }
  };

  const toggleCouponStatus = async (couponId, currentStatus) => {
    try {
      await updateDiscount(couponId, { active: !currentStatus });
      await loadData(); // Recargar lista
    } catch (err) {
      console.error('Error actualizando cupón:', err);
      setError('Error al actualizar cupón');
    }
  };

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
        <h5 className="text-primary-light mb-0">Cupones y Descuentos</h5>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          <i className="fas fa-plus me-2"></i>
          Nuevo Cupón
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
              <h6 className="text-primary-light mb-3">Crear Nuevo Cupón</h6>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Código del Cupón *</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark border-secondary text-white text-uppercase"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      required
                      disabled={loading}
                      placeholder="EJ: VERANO20"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-primary-light">Tipo de Descuento *</label>
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
                      {formData.type === 'PERCENTAGE' ? 'Porcentaje de Descuento *' : 'Monto de Descuento *'}
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
                    <label className="form-label text-primary-light">Alcance *</label>
                    <select 
                      className="form-select bg-dark border-secondary text-white"
                      value={formData.scope}
                      onChange={(e) => setFormData({...formData, scope: e.target.value})}
                      disabled={loading}
                    >
                      <option value="PRODUCT">Producto Específico</option>
                      <option value="SELLER">Todos mis Productos</option>
                    </select>
                  </div>

                  {formData.scope === 'PRODUCT' && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-primary-light">Producto *</label>
                      <select 
                        className="form-select bg-dark border-secondary text-white"
                        value={formData.targetProductId}
                        onChange={(e) => setFormData({...formData, targetProductId: e.target.value})}
                        required={formData.scope === 'PRODUCT'}
                        disabled={loading}
                      >
                        <option value="">Selecciona un producto</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

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
                    <label className="form-label text-primary-light">Cantidad Mínima (opcional)</label>
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
                    <label className="form-label text-primary-light">Cantidad Máxima (opcional)</label>
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
                    {loading ? 'Creando...' : 'Crear Cupón'}
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

        {/* Lista de cupones */}
        <div className="table-responsive">
          <table className="table table-dark table-borderless">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descuento</th>
                <th>Alcance</th>
                <th>Válido Hasta</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id}>
                  <td className="text-primary-light font-monospace">
                    <strong>{coupon.code}</strong>
                  </td>
                  <td>
                    {coupon.type === 'PERCENTAGE' 
                      ? `${coupon.value}%`
                      : `$${coupon.value}`
                    }
                  </td>
                  <td>
                    <span className="badge bg-info">
                      {coupon.scope === 'PRODUCT' ? 'Producto Específico' : 'Todos los Productos'}
                    </span>
                  </td>
                  <td className="text-muted">
                    {coupon.endsAt ? new Date(coupon.endsAt).toLocaleDateString() : 'Sin fecha límite'}
                  </td>
                  <td>
                    <span className={`badge ${coupon.active ? 'bg-success' : 'bg-danger'}`}>
                      {coupon.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => toggleCouponStatus(coupon.id, coupon.active)}
                      disabled={loading}
                    >
                      {coupon.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <div className="text-center text-muted py-4">
              No hay cupones creados. Crea tu primer cupón para empezar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}