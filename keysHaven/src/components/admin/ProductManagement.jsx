import React, { useState, useEffect } from 'react';
import { getAllProducts, updateProduct, getProductsPage } from '../../services/adminService';
import ConfirmModal from '../profile/ConfirmModal';
import PaginationBar from '../catalog/PaginationBar';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageManagerMode, setImageManagerMode] = useState(false);
  const [newImage, setNewImage] = useState({ name: '', url: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imageError, setImageError] = useState('');

  const [confirm, setConfirm] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const imageCategories = [
    'Portada principal',
    'Gameplay 1',
    'Gameplay 2',
    'Gameplay 3',
    'Tráiler',
    'Captura de pantalla',
    'Arte conceptual'
  ];

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const resp = await getProductsPage(page, pageSize);
      if (resp && resp.content && Array.isArray(resp.content)) {
        setProducts(resp.content);
        setTotalPages(resp.totalPages ?? 1);
      } else {
        setProducts(Array.isArray(resp) ? resp : []);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error cargando productos:', err);
      if (err && err.status === 401) {
        setError('No autorizado. Iniciá sesión.');
      } else if (err && err.status === 403) {
        setError('Acceso denegado.');
      } else {
        setError('Error al cargar productos (revisá que el API_BASE sea correcto)');
      }
    } finally {
      setLoading(false);
    }
  };

  const closeConfirm = () => setConfirm({ show: false, title: '', message: '', onConfirm: null });

  const handleToggleRequest = (product) => {
    if (product.active) {
      setConfirm({
        show: true,
        title: 'Desactivar Producto',
        message: `¿Estás seguro que querés desactivar el producto "${product.title}"? Podrás activarlo luego.`,
        onConfirm: () => handleDeactivateConfirmed(product.id)
      });
    } else {
      handleActivate(product.id);
    }
  };

  const handleDeactivateConfirmed = async (productId) => {
    setActionLoading(`status-${productId}`);
    try {
      await updateProduct(productId, { active: false });

      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, active: false } : p
        )
      );

      console.log(`Producto ${productId} desactivado`);
    } catch (err) {
      console.error('Error desactivando producto:', err);
      setError('Error al desactivar producto');
    } finally {
      setActionLoading(null);
      closeConfirm();
    }
  };

  const handleActivate = async (productId) => {
    setActionLoading(`status-${productId}`);
    try {
      await updateProduct(productId, { active: true });

      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, active: true } : p
        )
      );

      console.log(`Producto ${productId} activado`);
    } catch (err) {
      console.error('Error activando producto:', err);
      setError('Error al activar producto');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (product) => {
    setActionLoading(`featured-${product.id}`);
    const originalFeatured = product.featured;

    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === product.id ? { ...p, featured: !p.featured } : p
      )
    );

    try {
      await updateProduct(product.id, { featured: !originalFeatured });

      console.log(`Producto ${product.id} - Destacado actualizado: ${!originalFeatured}`);
    } catch (err) {
      console.error('Error actualizando producto:', err);
      setError('Error al actualizar producto');

      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === product.id ? { ...p, featured: originalFeatured } : p
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const deriveAvailableStock = (product) => {
    if (!product) return 0;

    const candidates = [
      product.availableStock,
      product.available_stock,
      product.available_stock_count,
      product.available,
      product.stock,
      product.availableQuantity,
      product.available_quantity,
      product.availableQty,
      product.available_qty,
      product.quantity,
      product.qty
    ];

    for (const c of candidates) {
      if (typeof c === 'number' && !Number.isNaN(c)) return c;

      if (typeof c === 'string' && c.trim() !== '' && !Number.isNaN(Number(c))) {
        return Number(c);
      }
    }

    try {
      if (product.inventory && typeof product.inventory === 'object') {
        const inv = product.inventory;
        const invCandidates = [inv.available, inv.availableStock, inv.stock, inv.qty, inv.quantity];
        for (const ic of invCandidates) {
          if (typeof ic === 'number' && !Number.isNaN(ic)) return ic;
          if (typeof ic === 'string' && ic.trim() !== '' && !Number.isNaN(Number(ic))) return Number(ic);
        }
      }
    } catch (e) {}

    return 0;
  };

  const isValidImageUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const checkImageExists = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const closeImageManager = () => {
    setImageManagerMode(false);
    setSelectedProduct(null);
    setError('');
    setImageError('');
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const addImage = async () => {
    if (!newImage.name.trim()) {
      setImageError('El nombre de la imagen es requerido');
      return;
    }

    if (!newImage.url.trim()) {
      setImageError('La URL de la imagen es requerida');
      return;
    }

    if (!isValidImageUrl(newImage.url)) {
      setImageError('La URL de la imagen no es válida');
      return;
    }

    // Verificar si la URL ya existe
    if (selectedProduct.images.some(img => img.url === newImage.url.trim())) {
      setImageError('Esta URL de imagen ya está agregada');
      return;
    }

    setLoading(true);
    setImageError('');

    try {
      // Verificar si la imagen existe
      const imageExists = await checkImageExists(newImage.url);
      if (!imageExists) {
        setImageError('No se pudo cargar la imagen desde la URL proporcionada');
        setLoading(false);
        return;
      }

      // Agregar la imagen
      setSelectedProduct(prev => ({
        ...prev,
        images: [...prev.images, {
          name: newImage.name.trim(),
          url: newImage.url.trim(),
          isPrimary: prev.images.length === 0,
          categories: [...selectedCategories]
        }]
      }));

      setNewImage({ name: '', url: '' });
      setSelectedCategories([]);
    } catch (err) {
      setImageError('Error al verificar la imagen');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    if (selectedProduct.images.length > 1) {
      const newImages = selectedProduct.images.filter((_, i) => i !== index);
      if (selectedProduct.images[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      setSelectedProduct(prev => ({ ...prev, images: newImages }));
    }
  };

  const setPrimaryImage = (index) => {
    const newImages = selectedProduct.images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    setSelectedProduct(prev => ({ ...prev, images: newImages }));
  };

  const updateImageName = (index, newName) => {
    const newImages = [...selectedProduct.images];
    newImages[index] = { ...newImages[index], name: newName };
    setSelectedProduct(prev => ({ ...prev, images: newImages }));
  };

  const updateImageUrl = (index, newUrl) => {
    const newImages = [...selectedProduct.images];
    newImages[index] = { ...newImages[index], url: newUrl };
    setSelectedProduct(prev => ({ ...prev, images: newImages }));
  };

  const saveImageChanges = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    setError('');

    try {
      const imageUrls = selectedProduct.images.map(img => img.url);


      await new Promise(resolve => setTimeout(resolve, 800));

      // Actualizar el producto en la lista
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === selectedProduct.id
            ? { ...p, imageUrls: imageUrls }
            : p
        )
      );

      console.log(`Imágenes actualizadas para producto ${selectedProduct.id}`);
      closeImageManager();
    } catch (err) {
      console.error('Error actualizando imágenes:', err);
      setError('Error al actualizar imágenes');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sellerDisplayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' ? product.active : !product.active);

    return matchesSearch && matchesStatus;
  });

  const getStockStatus = (stock) => {
    if (stock > 10) return { class: 'bg-success', text: 'En stock' };
    if (stock > 0) return { class: 'bg-warning', text: 'Stock bajo' };
    return { class: 'bg-danger', text: 'Sin stock' };
  };

  // Renderizar gestor de imágenes
  if (imageManagerMode && selectedProduct) {
    return (
      <div className="card bg-primary-dark border-0">
        <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
          <h5 className="text-primary-light mb-0">
            <i className="fas fa-images me-2"></i>
            Gestión de Imágenes - {selectedProduct.title}
          </h5>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={closeImageManager}
            disabled={loading}
          >
            <i className="fas fa-arrow-left me-1"></i>
            Volver a Productos
          </button>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Información del producto */}
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-primary-light">
                    <i className="fas fa-gamepad me-2"></i>
                    {selectedProduct.title}
                  </h6>
                  <p className="text-muted mb-0">
                    <i className="fas fa-user me-1"></i>
                    Vendedor: {selectedProduct.sellerDisplayName}
                  </p>
                </div>
                <div className="col-md-6 text-end">
                  <span className={`badge ${selectedProduct.active ? 'bg-success' : 'bg-danger'}`}>
                    {selectedProduct.active ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className={`badge ${selectedProduct.featured ? 'bg-warning ms-2' : 'bg-secondary ms-2'}`}>
                    {selectedProduct.featured ? 'Destacado' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Gestión de imágenes */}
          <div className="row mb-4">
            {selectedProduct.images.map((image, index) => (
              <div key={index} className="col-md-4 mb-3">
                <div className="card bg-dark border-secondary h-100">
                  <div className="card-img-top position-relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      style={{ height: '200px', objectFit: 'cover', width: '100%' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200/333/666?text=Imagen+No+Disponible';
                      }}
                    />
                    {image.isPrimary && (
                      <span className="position-absolute top-0 start-0 badge bg-warning m-2">
                        <i className="fas fa-star me-1"></i>
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <label className="form-label text-primary-light small mb-1">
                        <i className="fas fa-tag me-1"></i>
                        Nombre
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-white"
                        value={image.name}
                        onChange={(e) => updateImageName(index, e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label text-primary-light small mb-1">
                        <i className="fas fa-link me-1"></i>
                        URL
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-white"
                        value={image.url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    {image.categories && image.categories.length > 0 && (
                      <div className="mb-2">
                        <label className="form-label text-primary-light small mb-1">
                          <i className="fas fa-tags me-1"></i>
                          Categorías
                        </label>
                        <div className="d-flex flex-wrap gap-1">
                          {image.categories.map(cat => (
                            <span key={cat} className="badge bg-info me-1">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="btn-group w-100">
                      {!image.isPrimary && (
                        <button
                          type="button"
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => setPrimaryImage(index)}
                          disabled={loading}
                        >
                          <i className="fas fa-star me-1"></i>
                          Principal
                        </button>
                      )}
                      {selectedProduct.images.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeImage(index)}
                          disabled={loading}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Agregar nueva imagen - SECCIÓN CORREGIDA */}
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-header">
              <h6 className="text-primary-light mb-0">
                <i className="fas fa-plus me-1"></i>
                Agregar Nueva Imagen
              </h6>
            </div>
            <div className="card-body">
              {imageError && (
                <div className="alert alert-warning py-2 mb-3" role="alert">
                  <small>
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    {imageError}
                  </small>
                </div>
              )}

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label text-primary-light small mb-1">
                    <i className="fas fa-tag me-1"></i>
                    Nombre de la imagen *
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white"
                    value={newImage.name}
                    onChange={(e) => {
                      setNewImage({ ...newImage, name: e.target.value });
                      setImageError('');
                    }}
                    placeholder="Portada principal, Gameplay 1, etc."
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-primary-light small mb-1">
                    <i className="fas fa-link me-1"></i>
                    URL de la imagen *
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white"
                    value={newImage.url}
                    onChange={(e) => {
                      setNewImage({ ...newImage, url: e.target.value });
                      setImageError('');
                    }}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Selector de categorías - CORREGIDO */}
              <div className="mb-3">
                <label className="form-label text-primary-light small mb-2">
                  <i className="fas fa-tags me-1"></i>
                  Tipo de imagen (selecciona al menos una)
                </label>
                <div className="card bg-dark border-secondary">
                  <div className="card-body py-2">
                    <div className="row">
                      {imageCategories.map(category => (
                        <div key={category} className="col-md-6 mb-1">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`category-${category.replace(/\s+/g, '-')}`}
                              checked={selectedCategories.includes(category)}
                              onChange={() => handleCategoryToggle(category)}
                              disabled={loading}
                            />
                            <label
                              className="form-check-label text-white small"
                              htmlFor={`category-${category.replace(/\s+/g, '-')}`}
                            >
                              {category}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedCategories.length === 0 && (
                  <div className="alert alert-warning mt-2 py-2" role="alert">
                    <small>
                      <i className="fas fa-exclamation-circle me-1"></i>
                      Debes seleccionar al menos una categoría para la imagen
                    </small>
                  </div>
                )}
              </div>

              {/* Botón agregar - CORREGIDO */}
              <div className="d-flex justify-content-between align-items-center">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addImage}
                  disabled={
                    loading ||
                    !newImage.name.trim() ||
                    !newImage.url.trim() ||
                    selectedCategories.length === 0
                  }
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Verificando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus me-1"></i>
                      Agregar Imagen
                    </>
                  )}
                </button>

                {selectedProduct.images.length === 0 && (
                  <small className="text-warning">
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    No hay imágenes agregadas. Agrega al menos una imagen para el producto.
                  </small>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={saveImageChanges}
              disabled={loading || selectedProduct.images.length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-1"></i>
                  Guardar Cambios
                </>
              )}
            </button>
            <button
              className="btn btn-secondary"
              onClick={closeImageManager}
              disabled={loading}
            >
              <i className="fas fa-times me-1"></i>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar lista normal de productos
  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid">
        <h5 className="text-primary-light mb-0">
          <i className="fas fa-gamepad me-2"></i>
          Gestión Global de Productos
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label text-primary-light">
              <i className="fas fa-search me-1"></i>
              Buscar
            </label>
            <input
              type="text"
              className="form-control bg-dark border-secondary text-white"
              placeholder="Nombre del producto o vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label text-primary-light">
              <i className="fas fa-filter me-1"></i>
              Estado
            </label>
            <select
              className="form-select bg-dark border-secondary text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              <i className="fas fa-eraser me-1"></i>
              Limpiar
            </button>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="table-responsive">
          <table className="table table-dark table-borderless">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Vendedor</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Imágenes</th>
                <th>Estado</th>
                <th>Destacado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Cargando productos...
                  </td>
                </tr>
              ) : filteredProducts.map(product => {
                const availableStock = deriveAvailableStock(product);
                const stockStatus = getStockStatus(availableStock);
                const isStatusLoading = actionLoading === `status-${product.id}`;
                const isFeaturedLoading = actionLoading === `featured-${product.id}`;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {product.imageUrls && product.imageUrls.length > 0 && (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.title}
                            className="rounded me-3"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/50x50/333/666?text=Imagen';
                            }}
                          />
                        )}
                        <div>
                          <div className="text-primary-light fw-bold">{product.title}</div>
                          <small className="text-muted">{product.platform} • {product.region}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-white">{product.sellerDisplayName}</div>
                      <small className="text-muted">ID: {product.sellerId}</small>
                    </td>
                    <td>
                      <div className="text-primary-light fw-bold">
                        USD {product.price}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${stockStatus.class}`}>
                        {availableStock} - {stockStatus.text}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info">
                        <i className="fas fa-image me-1"></i>
                        {product.imageUrls?.length || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${product.active ? 'bg-success' : 'bg-danger'}`}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${product.featured ? 'bg-warning' : 'bg-secondary'}`}>
                        {product.featured ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-warning"
                          onClick={() => handleToggleFeatured(product)}
                          title={product.featured ? 'Quitar destacado' : 'Destacar'}
                          disabled={isFeaturedLoading}
                        >
                          {isFeaturedLoading ? (
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </div>
                          ) : (
                            <i className={`fas fa-star ${product.featured ? 'text-warning' : ''}`}></i>
                          )}
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleToggleRequest(product)}
                          title={product.active ? 'Desactivar' : 'Activar'}
                          disabled={isStatusLoading}
                        >
                          {isStatusLoading ? (
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </div>
                          ) : (
                            <i className={`fas ${product.active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center text-muted py-4">
              <i className="fas fa-search fa-2x mb-3"></i>
              <p>No se encontraron productos que coincidan con los filtros</p>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-center mt-3">
          <PaginationBar page={page} setPage={setPage} totalPages={Math.max(1, totalPages)} />
        </div>

        {/* Estadísticas */}
        <div className="row mt-4">
          <div className="col-md-3">
            <div className="card bg-primary-mid border-0">
              <div className="card-body text-center py-3">
                <h4 className="text-primary-light mb-1">{products.length}</h4>
                <p className="text-muted mb-0 small">Total Productos</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-primary-mid border-0">
              <div className="card-body text-center py-3">
                <h4 className="text-primary-light mb-1">
                  {products.filter(p => p.active).length}
                </h4>
                <p className="text-muted mb-0 small">Productos Activos</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-primary-mid border-0">
              <div className="card-body text-center py-3">
                <h4 className="text-primary-light mb-1">
                  {products.filter(p => p.featured).length}
                </h4>
                <p className="text-muted mb-0 small">Destacados</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-primary-mid border-0">
              <div className="card-body text-center py-3">
                <h4 className="text-primary-light mb-1">
                  {new Set(products.map(p => p.sellerId)).size}
                </h4>
                <p className="text-muted mb-0 small">Vendedores Únicos</p>
              </div>
            </div>
          </div>
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
