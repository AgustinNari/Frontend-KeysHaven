import React, { useState, useEffect } from 'react';
import { getSellerActiveProducts, addBulkDigitalKeys, getProductKeys } from '../../services/sellerService';
import { useAuth } from '../../context/AuthContext';

export default function KeyManagement() {
  const { user } = useAuth();
  const sellerId = user?.id;

  const [selectedProduct, setSelectedProduct] = useState('');
  const [keys, setKeys] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [bulkKeys, setBulkKeys] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const prods = await getSellerActiveProducts(user.id);
        setProducts(prods || []);
      } catch (err) {
        console.error('Error cargando productos:', err);
        setProducts([]);
      }
    }
    if (user?.id) load();
  }, [user]);

  useEffect(() => {
    if (selectedProduct) {
      loadProductKeys(parseInt(selectedProduct, 10));
    } else {
      setKeys([]);
    }
  }, [selectedProduct]);

  const loadProductKeys = async (productId) => {
    try {
      const keysData = await getProductKeys(productId);
      let ks = keysData ?? [];
      if (!Array.isArray(ks)) {
        if (Array.isArray(ks.content)) ks = ks.content;
        else if (Array.isArray(ks.items)) ks = ks.items;
        else if (typeof ks === 'object' && ks !== null) {
          ks = ks.content ?? ks.items ?? ks.data ?? [];
        } else {
          ks = [];
        }
      }
      setKeys(ks);
    } catch (err) {
      console.error('Error cargando claves:', err);
      setError('Error al cargar claves');
      setKeys([]);
    }
  };

  const handleAddBulkKeys = async () => {
    if (!bulkKeys.trim() || !selectedProduct) return;
    setLoading(true);
    setError('');
    try {
      const keyList = bulkKeys.split('\n').map(k => k.trim()).filter(k => k.length > 0);
      const payload = { productId: parseInt(selectedProduct, 10), keyCodes: keyList };
      await addBulkDigitalKeys(payload);
      setBulkKeys('');
      await loadProductKeys(parseInt(selectedProduct, 10));
    } catch (err) {
      console.error('Error agregando claves en lote:', err);
      setError(err?.message || 'Error al agregar claves');
    } finally {
      setLoading(false);
    }
  };

  const keyList = Array.isArray(keys) ? keys : (keys?.content ?? keys?.items ?? []);
  const totalCount = Array.isArray(keyList) ? keyList.length : 0;
  const usedCount = Array.isArray(keyList) ? keyList.filter(key => key.status === 'SOLD' || key.used).length : 0;
  const availableCount = Array.isArray(keyList) ? keyList.filter(key => key.status === 'AVAILABLE' || !key.used).length : 0;

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid">
        <h5 className="text-primary-light mb-0">Gestión de Claves Digitales</h5>
        {selectedProduct && (
          <small className="text-muted"> Claves disponibles: {availableCount} | Claves usadas: {usedCount} | Total: {totalCount} </small>
        )}
      </div>

      <div className="card-body">
        {error && (<div className="alert alert-danger" role="alert">{error}</div>)}

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
                <option key={product.id} value={product.id}>{product.title} ({product.platform})</option>
              ))}
            </select>
          </div>
        </div>

        {selectedProduct && (
          <>
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

            <div className="table-responsive">
              <table className="table table-dark table-borderless">
                <thead>
                  <tr><th>Clave</th><th>Estado</th><th>Fecha de Creación</th><th>Fecha de Uso</th></tr>
                </thead>
                <tbody>
                  {Array.isArray(keyList) && keyList.map(key => (
                    <tr key={key.id ?? key.keyMask ?? Math.random()}>
                      <td className="font-monospace" style={{fontSize:'0.9em'}}>{key.keyCode}</td>
                      <td>
                        <span className={`badge ${(key.status === 'SOLD' || key.used) ? 'bg-secondary' : 'bg-success'}`}>
                          {(key.status === 'SOLD' || key.used) ? 'Usada' : 'Disponible'}
                        </span>
                      </td>
                      <td className="text-muted">{key.createdAt ? new Date(key.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="text-muted">{key.soldAt ? new Date(key.soldAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(!Array.isArray(keyList) || keyList.length === 0) && (<div className="text-center text-muted py-4">No hay claves agregadas para este producto</div>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
