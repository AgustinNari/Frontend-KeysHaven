import React, { useState, useEffect } from 'react';
import { getSellerProducts, addDigitalKey, addBulkDigitalKeys, getProductKeys } from '../../services/sellerService';

export default function KeyManagement() {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [keys, setKeys] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [bulkKeys, setBulkKeys] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar productos del vendedor
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getSellerProducts();
        setProducts(productsData);
      } catch (err) {
        console.error('Error cargando productos:', err);
        setError('Error al cargar productos');
      }
    };
    loadProducts();
  }, []);

  // Cargar claves cuando se selecciona un producto
  useEffect(() => {
    if (selectedProduct) {
      loadProductKeys(selectedProduct);
    }
  }, [selectedProduct]);

  const loadProductKeys = async (productId) => {
    try {
      const keysData = await getProductKeys(productId);
      setKeys(keysData);
    } catch (err) {
      console.error('Error cargando claves:', err);
      setError('Error al cargar claves');
    }
  };

  const handleAddSingleKey = async () => {
    if (!newKey.trim() || !selectedProduct) return;
    
    setLoading(true);
    setError('');

    try {
      const payload = {
        productId: parseInt(selectedProduct),
        keyCode: newKey.trim(),
        keyMask: null // Opcional según el DTO
      };

      await addDigitalKey(payload);
      setNewKey('');
      await loadProductKeys(selectedProduct); // Recargar claves
    } catch (err) {
      console.error('Error agregando clave:', err);
      setError(err.response?.data?.message || 'Error al agregar clave');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBulkKeys = async () => {
    if (!bulkKeys.trim() || !selectedProduct) return;
    
    setLoading(true);
    setError('');

    try {
      const keyList = bulkKeys.split('\n')
        .map(key => key.trim())
        .filter(key => key.length > 0);

      const payload = {
        productId: parseInt(selectedProduct),
        keyCodes: keyList
      };

      await addBulkDigitalKeys(payload);
      setBulkKeys('');
      await loadProductKeys(selectedProduct); // Recargar claves
    } catch (err) {
      console.error('Error agregando claves en lote:', err);
      setError(err.response?.data?.message || 'Error al agregar claves');
    } finally {
      setLoading(false);
    }
  };

  const getUsedKeysCount = () => keys.filter(key => key.used).length;
  const getAvailableKeysCount = () => keys.filter(key => !key.used).length;

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid">
        <h5 className="text-primary-light mb-0">Gestión de Claves Digitales</h5>
        {selectedProduct && (
          <small className="text-muted">
            Claves disponibles: {getAvailableKeysCount()} | 
            Claves usadas: {getUsedKeysCount()} | 
            Total: {keys.length}
          </small>
        )}
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Selección de Producto */}
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label text-primary-light">Seleccionar Producto *</label>
            <select 
              className="form-select bg-dark border-secondary text-white"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Selecciona un producto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.title} ({product.platform})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedProduct && (
          <>
            {/* Agregar Clave Individual */}
            <div className="row mb-4">
              <div className="col-md-8">
                <label className="form-label text-primary-light">Agregar Clave Individual</label>
                <input 
                  type="text" 
                  className="form-control bg-dark border-secondary text-white"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Ingresa una clave individual..."
                  disabled={loading}
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button 
                  className="btn btn-primary w-100"
                  onClick={handleAddSingleKey}
                  disabled={loading || !selectedProduct || !newKey.trim()}
                >
                  {loading ? 'Agregando...' : 'Agregar Clave'}
                </button>
              </div>
            </div>

            {/* Agregar Múltiples Claves */}
            <div className="row mb-4">
              <div className="col-12">
                <label className="form-label text-primary-light">Agregar Múltiples Claves (una por línea)</label>
                <textarea 
                  className="form-control bg-dark border-secondary text-white"
                  rows="4"
                  value={bulkKeys}
                  onChange={(e) => setBulkKeys(e.target.value)}
                  placeholder="Pega múltiples claves, una por línea..."
                  disabled={loading}
                />
              </div>
              <div className="col-12 mt-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={handleAddBulkKeys}
                  disabled={loading || !selectedProduct || !bulkKeys.trim()}
                >
                  {loading ? 'Agregando...' : `Agregar ${bulkKeys.split('\n').filter(k => k.trim()).length} Claves`}
                </button>
              </div>
            </div>

            {/* Lista de Claves */}
            <div className="table-responsive">
              <table className="table table-dark table-borderless">
                <thead>
                  <tr>
                    <th>Clave</th>
                    <th>Estado</th>
                    <th>Fecha de Creación</th>
                    <th>Fecha de Uso</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map(key => (
                    <tr key={key.id}>
                      <td className="font-monospace" style={{fontSize: '0.9em'}}>
                        {key.keyCode}
                      </td>
                      <td>
                        <span className={`badge ${key.used ? 'bg-secondary' : 'bg-success'}`}>
                          {key.used ? 'Usada' : 'Disponible'}
                        </span>
                      </td>
                      <td className="text-muted">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-muted">
                        {key.usedAt ? new Date(key.usedAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {keys.length === 0 && (
                <div className="text-center text-muted py-4">
                  No hay claves agregadas para este producto
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}