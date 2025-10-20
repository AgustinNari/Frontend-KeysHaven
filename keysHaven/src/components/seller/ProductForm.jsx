import React, { useState, useEffect } from 'react';
import { createProduct, updateProduct, getCategories } from '../../services/sellerService';

export default function ProductForm({ product, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    categoryIds: new Set(),
    platform: 'PC',
    region: 'Global',
    minPurchaseQuantity: 1,
    maxPurchaseQuantity: 10,
    releaseDate: '',
    developer: '',
    publisher: '',
    metacriticScore: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar categorías disponibles
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error cargando categorías:', err);
        setError('Error al cargar categorías');
      }
    };
    loadCategories();
  }, []);

  // Si estamos editando, cargar datos del producto
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        currency: product.currency || 'USD',
        categoryIds: new Set(product.categories?.map(cat => cat.id.toString()) || []),
        platform: product.platform || 'PC',
        region: product.region || 'Global',
        minPurchaseQuantity: product.minPurchaseQuantity || 1,
        maxPurchaseQuantity: product.maxPurchaseQuantity || 10,
        releaseDate: product.releaseDate || '',
        developer: product.developer || '',
        publisher: product.publisher || '',
        metacriticScore: product.metacriticScore?.toString() || ''
      });
    }
  }, [product]);

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const newCategoryIds = new Set(prev.categoryIds);
      if (newCategoryIds.has(categoryId)) {
        newCategoryIds.delete(categoryId);
      } else {
        newCategoryIds.add(categoryId);
      }
      return { ...prev, categoryIds: newCategoryIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones
      if (formData.categoryIds.size === 0) {
        setError('Selecciona al menos una categoría');
        setLoading(false);
        return;
      }

      if (parseInt(formData.minPurchaseQuantity) > parseInt(formData.maxPurchaseQuantity)) {
        setError('La cantidad mínima no puede ser mayor que la máxima');
        setLoading(false);
        return;
      }

      // CORRECCIÓN: Usar Number en lugar de BigDecimal
      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price), // Cambiado a parseFloat
        currency: formData.currency,
        categoryIds: Array.from(formData.categoryIds).map(id => parseInt(id)),
        platform: formData.platform,
        region: formData.region,
        minPurchaseQuantity: parseInt(formData.minPurchaseQuantity),
        maxPurchaseQuantity: parseInt(formData.maxPurchaseQuantity),
        releaseDate: formData.releaseDate || null,
        developer: formData.developer || null,
        publisher: formData.publisher || null,
        metacriticScore: formData.metacriticScore ? parseInt(formData.metacriticScore) : null
      };

      if (product) {
        // Actualizar producto existente
        await updateProduct(product.id, payload);
      } else {
        // Crear nuevo producto
        await createProduct(payload);
      }

      onSuccess();
    } catch (err) {
      console.error('Error guardando producto:', err);
      setError(err.response?.data?.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid">
        <h5 className="text-primary-light mb-0">
          {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Título del Juego *</label>
              <input 
                type="text" 
                className="form-control bg-dark border-secondary text-white"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                disabled={loading}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Precio *</label>
              <div className="input-group">
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  className="form-control bg-dark border-secondary text-white"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                  disabled={loading}
                />
                <select 
                  className="form-select bg-dark border-secondary text-white"
                  style={{maxWidth: '100px'}}
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  disabled={loading}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="ARS">ARS</option>
                </select>
              </div>
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Plataforma *</label>
              <select 
                className="form-select bg-dark border-secondary text-white"
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                required
                disabled={loading}
              >
                <option value="PC">PC</option>
                <option value="PlayStation">PlayStation</option>
                <option value="Xbox">Xbox</option>
                <option value="Nintendo Switch">Nintendo Switch</option>
                <option value="Mobile">Mobile</option>
                <option value="Multiplataforma">Multiplataforma</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Región *</label>
              <select 
                className="form-select bg-dark border-secondary text-white"
                value={formData.region}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
                required
                disabled={loading}
              >
                <option value="Global">Global</option>
                <option value="North America">Norte América</option>
                <option value="Europe">Europa</option>
                <option value="Latin America">Latinoamérica</option>
                <option value="Asia">Asia</option>
                <option value="Oceania">Oceanía</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Cantidad Mínima de Compra</label>
              <input 
                type="number" 
                min="1"
                className="form-control bg-dark border-secondary text-white"
                value={formData.minPurchaseQuantity}
                onChange={(e) => setFormData({...formData, minPurchaseQuantity: e.target.value})}
                disabled={loading}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Cantidad Máxima de Compra</label>
              <input 
                type="number" 
                min="1"
                className="form-control bg-dark border-secondary text-white"
                value={formData.maxPurchaseQuantity}
                onChange={(e) => setFormData({...formData, maxPurchaseQuantity: e.target.value})}
                disabled={loading}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Desarrollador</label>
              <input 
                type="text" 
                className="form-control bg-dark border-secondary text-white"
                value={formData.developer}
                onChange={(e) => setFormData({...formData, developer: e.target.value})}
                disabled={loading}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Publicador</label>
              <input 
                type="text" 
                className="form-control bg-dark border-secondary text-white"
                value={formData.publisher}
                onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                disabled={loading}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Fecha de Lanzamiento</label>
              <input 
                type="date" 
                className="form-control bg-dark border-secondary text-white"
                value={formData.releaseDate}
                onChange={(e) => setFormData({...formData, releaseDate: e.target.value})}
                disabled={loading}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Puntuación Metacritic (0-100)</label>
              <input 
                type="number" 
                min="0"
                max="100"
                className="form-control bg-dark border-secondary text-white"
                value={formData.metacriticScore}
                onChange={(e) => setFormData({...formData, metacriticScore: e.target.value})}
                disabled={loading}
              />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label text-primary-light">Descripción</label>
              <textarea 
                className="form-control bg-dark border-secondary text-white" 
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                disabled={loading}
              ></textarea>
            </div>

            <div className="col-12 mb-3">
              <label className="form-label text-primary-light">Categorías *</label>
              <div className="d-flex flex-wrap gap-3">
                {categories.map(category => (
                  <div key={category.id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={formData.categoryIds.has(category.id.toString())}
                      onChange={() => handleCategoryToggle(category.id.toString())}
                      disabled={loading}
                    />
                    <label 
                      className="form-check-label text-white" 
                      htmlFor={`category-${category.id}`}
                    >
                      {category.description}
                    </label>
                  </div>
                ))}
              </div>
              {formData.categoryIds.size === 0 && (
                <small className="text-danger">Selecciona al menos una categoría</small>
              )}
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || formData.categoryIds.size === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Guardando...
                </>
              ) : (
                product ? 'Actualizar Producto' : 'Crear Producto'
              )}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onSuccess}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}