import React, { useState, useEffect } from 'react';
import { getSellerActiveProducts, addBulkDigitalKeys, getProductKeys } from '../../services/sellerService';
import PaginationBar from '../catalog/PaginationBar';
import { useAppSelector } from '../../redux/hooks';
import { selectUser } from '../../redux/slices/authSlice';



export default function KeyManagement() {
  const user = useAppSelector(selectUser);
  const sellerId = user?.id;

  const [selectedProduct, setSelectedProduct] = useState('');
  const [keysPage, setKeysPage] = useState(1);
  const [keysPageSize] = useState(20);
  const [keysItems, setKeysItems] = useState([]);
  const [keysTotal, setKeysTotal] = useState(0);

  const [bulkKeys, setBulkKeys] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setError('');
    try {
      const prods = await getSellerActiveProducts(sellerId);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (err) {
      console.error('Error cargando productos:', err);
      setProducts([]);
      setError('No se pudieron cargar los productos');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (sellerId) fetchProducts();
    else setProducts([]);
  }, [sellerId]);

  useEffect(() => {
    if (selectedProduct) loadProductKeys(parseInt(selectedProduct, 10), keysPage);
    else {
      setKeysItems([]); setKeysTotal(0);
    }
  }, [selectedProduct, keysPage]);

  const loadProductKeys = async (productId, page = 1) => {
    setLoading(true);
    setError('');
    try {
      const resp = await getProductKeys(productId, Math.max(0, page - 1), keysPageSize);
      const items = resp.items || [];
      setKeysItems(items);
      setKeysTotal(resp.total || items.length);
    } catch (err) {
      console.error('Error cargando claves:', err);
      setError('Error al cargar claves');
      setKeysItems([]);
      setKeysTotal(0);
    } finally {
      setLoading(false);
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
      await loadProductKeys(parseInt(selectedProduct, 10), keysPage);
      await fetchProducts();
    } catch (err) {
      console.error('Error agregando claves en lote:', err);
      setError(err?.message || 'Error al agregar claves');
    } finally {
      setLoading(false);
    }
  };

  const totalCount = keysTotal;
  const usedCount = (keysItems || []).filter(key => key.status === 'SOLD' || key.used).length;
  const availableCount = Math.max(0, (keysTotal - usedCount));

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid">
        <h5 className="text-primary-light mb-0">Gestión de Claves Digitales</h5>
        {selectedProduct && (
          <small className="text-muted"> Claves disponibles: {availableCount} | Claves usadas (en página): {usedCount} | Total: {totalCount} </small>
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
              onChange={(e) => { setSelectedProduct(e.target.value); setKeysPage(1); }}
              required
              disabled={loading || loadingProducts}
            >
              <option value="">{loadingProducts ? 'Cargando productos...' : 'Selecciona un producto'}</option>
              {Array.isArray(products) && products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.title} {product.platform ? `(${product.platform})` : ''}
                </option>
              ))}
            </select>
            {Array.isArray(products) && products.length === 0 && !loadingProducts && (
              <small className="text-muted d-block mt-2">No se encontraron productos. Asegurate de tener productos activos en tu catálogo.</small>
            )}
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
                  {keysItems.map(key => (
                    <tr key={key.id ?? key.keyMask ?? Math.random()}>
                      <td className="font-monospace" style={{fontSize:'0.9em'}}>{key.keyCode ?? key.keyMask ?? '—'}</td>
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

              {(!keysItems || keysItems.length === 0) && (<div className="text-center text-muted py-4">No hay claves en esta página para el producto seleccionado</div>)}
            </div>

            <div className="d-flex justify-content-center mt-3">
              <PaginationBar page={keysPage} setPage={setKeysPage} totalPages={Math.max(1, Math.ceil(keysTotal / keysPageSize))} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
