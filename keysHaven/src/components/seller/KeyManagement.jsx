import { localizeErrorMessage } from '../../utils/displayText';
import React, { useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { selectUser } from '../../redux/slices/authSlice';
import {
  fetchSellerActiveProducts,
  addBulkDigitalKeys as addBulkDigitalKeysThunk,
  getProductKeys as getProductKeysThunk,
  fetchSellerProductsPaginated
} from '../../redux/slices/sellerPanelSlice';
import PaginationBar from '../catalog/PaginationBar';
import { fetchProductDetail } from '../../redux/slices/productDetailSlice';

export default function KeyManagement() {
  const user = useAppSelector(selectUser);
  const sellerId = user?.id;
  const dispatch = useAppDispatch();

  const productsFromState = useAppSelector(state => state.sellerPanel.activeProducts);
  const keysByProduct = useAppSelector(state => state.sellerPanel.keysByProduct);

  const EMPTY_ARRAY = React.useMemo(() => [], []);
  const products = productsFromState ?? EMPTY_ARRAY;

  const [selectedProduct, setSelectedProduct] = React.useState('');
  const [keysPage, setKeysPage] = React.useState(1);
  const keysPageSize = 20;

  const selectedNum = Number(selectedProduct);


  const zeroBasedPage = Math.max(0, keysPage - 1);


  const selectedProductCache = selectedProduct ? keysByProduct?.[String(selectedNum)] : undefined;
  const selectedKeysPageCache = selectedProductCache?.pages?.[String(zeroBasedPage)];
  const keysItems = selectedKeysPageCache?.items ?? EMPTY_ARRAY;
  const keysTotal = selectedProductCache?.total ?? selectedKeysPageCache?.total ?? 0;

  const [bulkKeys, setBulkKeys] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [loadingProducts, setLoadingProducts] = React.useState(false);
  const [error, setError] = React.useState('');


  useEffect(() => {
    const fetchProducts = async () => {
      if (!sellerId) return;

      setLoadingProducts(true);
      setError('');
      try {
        await dispatch(fetchSellerActiveProducts({ sellerId })).unwrap();
      } catch (err) {
        console.error('Error cargando productos:', err);
        setError('No se pudieron cargar los productos');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [sellerId, dispatch]);

  const loadProductKeys = useCallback(async (productId, page = 0) => {
    setLoading(true);
    setError('');
    try {
      const keysByProduct = dispatch((send, getState) => getState().sellerPanel.keysByProduct);
      const cachedForProduct = keysByProduct?.[String(productId)];
      const cachedPage = cachedForProduct && cachedForProduct.pages && cachedForProduct.pages[String(page)];
      if (cachedPage && Array.isArray(cachedPage.items) && cachedPage.items.length >= 0) {
        setLoading(false);
        return;
      }
      await dispatch(getProductKeysThunk({ productId, page, size: keysPageSize })).unwrap();
    } catch (err) {
      console.error('Error cargando claves:', err);
      setError('Error al cargar claves');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { if (selectedProduct) loadProductKeys(Number(selectedProduct), zeroBasedPage); }, [selectedProduct, zeroBasedPage, loadProductKeys]);

  const handleAddBulkKeys = async () => {
    if (!bulkKeys.trim() || !selectedProduct) return;
    setLoading(true);
    setError('');
    try {
      const keyList = bulkKeys.split('\n').map(k => k.trim()).filter(k => k.length > 0);
      const payload = { productId: parseInt(selectedProduct, 10), keyCodes: keyList };
      await dispatch(addBulkDigitalKeysThunk(payload)).unwrap();

      setBulkKeys('');
      await dispatch(getProductKeysThunk({ productId: parseInt(selectedProduct, 10), page: Math.max(0, keysPage - 1), size: keysPageSize, force: true })).unwrap();

      await dispatch(fetchProductDetail(parseInt(selectedProduct, 10))).unwrap();

      if (sellerId) await dispatch(fetchSellerProductsPaginated({ sellerId, page: 0, size: 10, force: true })).unwrap();
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
        {error && (<div className="alert alert-danger" role="alert">{localizeErrorMessage(error)}</div>)}

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
                  {keysItems.map((key, idx) => (
                    <tr key={key.id ?? key.keyMask ?? idx}>
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

              {(keysItems.length === 0) && (<div className="text-center text-muted py-4">No hay claves en esta página para el producto seleccionado</div>)}
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
