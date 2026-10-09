import { localizeErrorMessage } from '../../utils/displayText';
import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import PaginationBar from '../catalog/PaginationBar';
import {
  fetchCategoriesPage as fetchCategoriesPageThunk,
  adminCreateCategory,
  adminUpdateCategory,
  setCategoriesPageFromCache
} from '../../redux/slices/adminPanelSlice';
import { fetchFeaturedCategories, fetchAllCategories } from '../../redux/slices/categoriesSlice';

export default function CategoryManagement() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector(state => state.adminPanel);
  const categoriesPage = admin?.categoriesPage ?? null;
  const categories = categoriesPage?.content ?? [];

  const [loadingLocal, setLoadingLocal] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ description: '' });

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, categoriesPage?.totalPages ?? 1);

  const pageKey = `${Math.max(1, Number(page) || 1)}_${pageSize}`;

  const loadCategories = useCallback(async (p = 1) => {
    setLoadingLocal(true);
    setError('');
    try {
      await dispatch(fetchCategoriesPageThunk({ page: p, size: pageSize })).unwrap();

      dispatch(fetchFeaturedCategories({ page: 0, size: 5 })).catch(()=>{});
    } catch (err) {
      console.error('Error cargando categorías:', err);
      setError('Error al cargar categorías');
    } finally {
      setLoadingLocal(false);
    }
  }, [dispatch]);

  useEffect(() => {

    if (admin?.categoriesPageCache?.[pageKey]) {
      dispatch(setCategoriesPageFromCache({ key: pageKey }));

      return;
    }

    loadCategories(page);


  }, [page, dispatch, pageKey, admin?.categoriesPageCache, loadCategories]);

  useEffect(() => { dispatch(fetchAllCategories()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLocal(true);
    setError('');
    try {
      if (editingCategory) {
        await dispatch(adminUpdateCategory({ categoryId: editingCategory.id, categoryData: formData })).unwrap();
      } else {
        await dispatch(adminCreateCategory(formData)).unwrap();
      }
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ description: '' });
    } catch (err) {
      console.error('Error guardando categoría:', err);
      setError(err?.message || 'Error al guardar categoría');
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ description: category.description ?? '' });
    setShowForm(true);
  };

  const handleToggleFeatured = async (categoryId, currentFeatured) => {
    setLoadingLocal(true);
    try {
      await dispatch(adminUpdateCategory({ categoryId, categoryData: { featured: !currentFeatured } })).unwrap();
      dispatch(fetchFeaturedCategories({ page: 0, size: 5 })).catch(()=>{});
    } catch (err) {
      console.error('Error actualizando categoría:', err);
      setError('Error al actualizar categoría');
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ description: '' });
  };

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid d-flex justify-content-between align-items-center">
        <h5 className="text-primary-light mb-0">Gestión de Categorías</h5>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} disabled={loadingLocal}>
          <i className="fas fa-plus me-2"></i> Nueva Categoría
        </button>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{localizeErrorMessage(error)}</div>}

        {showForm && (
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-body">
              <h6 className="text-primary-light mb-3">{editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h6>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-8">
                    <label className="form-label text-primary-light">Descripción *</label>
                    <input type="text" className="form-control bg-dark border-secondary text-white" value={formData.description} onChange={(e) => setFormData({ description: e.target.value })} required disabled={loadingLocal} placeholder="Ej: Juegos de Rol" />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <div className="d-flex gap-2 w-100">
                      <button type="submit" className="btn btn-primary flex-fill" disabled={loadingLocal || !formData.description.trim()}>
                        {loadingLocal ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={loadingLocal}>Cancelar</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-dark table-borderless">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Productos</th>
                <th>Destacada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loadingLocal && !showForm ? (
                <tr><td colSpan="5" className="text-center text-muted py-4">Cargando categorías...</td></tr>
              ) : categories.map(category => (
                <tr key={category.id}>
                  <td className="text-muted">#{category.id}</td>
                  <td className="text-primary-light fw-bold">{category.description}</td>
                  <td><span className="badge bg-secondary">{category.productCount || 0}</span></td>
                  <td>
                    <span className={`badge ${category.featured ? 'bg-warning' : 'bg-secondary'}`}>{category.featured ? 'Sí' : 'No'}</span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary" onClick={() => handleEdit(category)} disabled={loadingLocal}>Editar</button>
                      <button className="btn btn-outline-warning" onClick={() => handleToggleFeatured(category.id, category.featured)} disabled={loadingLocal}>
                        {category.featured ? 'Quitar Destacado' : 'Destacar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loadingLocal && categories.length === 0 && <div className="text-center text-muted py-4">No hay categorías creadas. Crea tu primera categoría.</div>}
        </div>

        <div className="d-flex justify-content-center mt-3">
          <PaginationBar page={page} setPage={setPage} totalPages={totalPages} />
        </div>

        {/* Estadísticas */}
        <div className="row mt-4">
          <div className="col-md-4"><div className="card bg-primary-mid border-0"><div className="card-body text-center py-3"><h4 className="text-primary-light mb-1">{categories.length}</h4><p className="text-muted mb-0 small">Total Categorías (página)</p></div></div></div>
          <div className="col-md-4"><div className="card bg-primary-mid border-0"><div className="card-body text-center py-3"><h4 className="text-primary-light mb-1">{categories.filter(c => c.featured).length}</h4><p className="text-muted mb-0 small">Categorías Destacadas (página)</p></div></div></div>
          <div className="col-md-4"><div className="card bg-primary-mid border-0"><div className="card-body text-center py-3"><h4 className="text-primary-light mb-1">{categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)}</h4><p className="text-muted mb-0 small">Total Productos (página)</p></div></div></div>
        </div>
      </div>
    </div>
  );
}
