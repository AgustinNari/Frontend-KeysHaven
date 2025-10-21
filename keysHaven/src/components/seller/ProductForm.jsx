import React, { useState, useEffect, useRef } from 'react';
import {
  createProduct, updateProduct, getCategories,
  addProductImage, updateProductImage, deleteProductImage
} from '../../services/sellerService';
import ConfirmModal from '../profile/ConfirmModal';

export default function ProductForm({ product, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '', description: '', price:'', currency:'USD',
    categoryIds: new Set(), platform:'PC', region:'Global',
    minPurchaseQuantity:1, maxPurchaseQuantity:10, releaseDate:'',
    developer:'', publisher:'', metacriticScore:'', images: []
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddImage, setShowAddImage] = useState(false);
  const [newImg, setNewImg] = useState({ name:'', file:null, url:'' });
  const [confirm, setConfirm] = useState({ show:false, title:'', message:'', onConfirm:null });

  const newFileRef = useRef(null);
  const replaceFileRefs = useRef({});

  useEffect(()=>{ (async ()=>{ try{ const cats = await getCategories(); setCategories(cats || []);}catch{} })(); }, []);

  useEffect(()=> {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        currency: product.currency || 'USD',
        categoryIds: new Set((product.categories||[]).map(c => String(c.id))),
        platform: product.platform || 'PC',
        region: product.region || 'Global',
        minPurchaseQuantity: product.minPurchaseQuantity || 1,
        maxPurchaseQuantity: product.maxPurchaseQuantity || 10,
        releaseDate: product.releaseDate || '',
        developer: product.developer || '',
        publisher: product.publisher || '',
        metacriticScore: product.metacriticScore?.toString() || '',
        images: (product.images || []).map(i => ({ id: i.id, name: i.name || '', dataUrl: i.dataUrl || '', isPrimary: !!i.isPrimary, contentType: i.contentType || null }))
      });
    } else {

      setFormData(prev => ({ ...prev, title:'', description:'', price:'', images: [] }));
    }
  }, [product]);

  const closeConfirm = () => setConfirm({ show:false, title:'', message:'', onConfirm:null });


  const fileToDataUrl = (file) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res({ dataUrl: reader.result, contentType: file.type });
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });


  const addImage = async () => {
    setError('');
    if (!newImg.name.trim()) { setError('La imagen necesita un nombre'); return; }
    if (!newImg.file && !newImg.url.trim()) { setError('Selecciona un archivo o pega una URL'); return; }
    setLoading(true);
    try {
      let dataUrl = newImg.url.trim();
      let contentType = null;
      if (newImg.file) {
        const r = await fileToDataUrl(newImg.file);
        dataUrl = r.dataUrl; contentType = r.contentType;
      }

      if (product && product.id) {
        const added = await addProductImage(product.id, { name: newImg.name.trim(), dataUrl, contentType });
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { id: added.id, name: added.name, dataUrl: added.dataUrl, isPrimary: added.isPrimary, contentType: added.contentType }]
        }));
      } else {

        const tmpId = 't'+Math.random().toString(36).slice(2,9);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { id: tmpId, name: newImg.name.trim(), dataUrl, isPrimary: prev.images.length===0, contentType }]
        }));
      }


      setNewImg({ name:'', file:null, url:'' });
      if (newFileRef.current) { newFileRef.current.value = ''; }
      setShowAddImage(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error agregando imagen');
    } finally {
      setLoading(false);
    }
  };


  const setPrimary = async (img) => {
    setLoading(true);
    try {
      if (product && product.id && String(img.id).startsWith('t') === false) {
        await updateProductImage(product.id, img.id, { isPrimary: true });
      }
      setFormData(prev => ({ ...prev, images: prev.images.map(i => ({ ...i, isPrimary: i.id === img.id })) }));
    } catch (err) {
      console.error(err);
      setError('Error marcando principal');
    } finally { setLoading(false); }
  };


  const replaceFile = async (imgId, file) => {
    if (!file) return;
    setLoading(true);
    try {
      const r = await fileToDataUrl(file);
      if (product && product.id && String(imgId).startsWith('t') === false) {
        await updateProductImage(product.id, imgId, { dataUrl: r.dataUrl, contentType: r.contentType });
      }
      setFormData(prev => ({ ...prev, images: prev.images.map(i => i.id === imgId ? { ...i, dataUrl: r.dataUrl, contentType: r.contentType } : i) }));

      if (replaceFileRefs.current[imgId]) replaceFileRefs.current[imgId].value = '';
    } catch (err) {
      console.error(err);
      setError('Error reemplazando imagen');
    } finally { setLoading(false); }
  };


  const renameImage = async (imgId, newName) => {
    setFormData(prev => ({ ...prev, images: prev.images.map(i => i.id === imgId ? { ...i, name: newName } : i) }));
    if (product && product.id && String(imgId).startsWith('t') === false) {
      try { await updateProductImage(product.id, imgId, { name: newName }); } catch (err) { console.error('Error guardando nombre', err); }
    }
  };


  const requestDeleteImage = (img) => {
    if ((formData.images || []).length <= 1) { setError('No se puede eliminar la última imagen'); return; }
    setConfirm({
      show: true,
      title: 'Eliminar imagen',
      message: `¿Eliminar "${img.name}"?`,
      onConfirm: async () => {
        setLoading(true);
        try {
          if (product && product.id && String(img.id).startsWith('t') === false) {
            await deleteProductImage(product.id, img.id);
            setFormData(prev => ({ ...prev, images: prev.images.filter(i => i.id !== img.id) }));
          } else {
            setFormData(prev => ({ ...prev, images: prev.images.filter(i => i.id !== img.id) }));
          }
        } catch (err) {
          console.error(err); setError(err.message || 'Error eliminando imagen');
        } finally { setLoading(false); closeConfirm(); }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (formData.categoryIds.size === 0) { setError('Selecciona al menos una categoría'); setLoading(false); return; }
      if (parseInt(formData.minPurchaseQuantity) > parseInt(formData.maxPurchaseQuantity)) { setError('Cantidad mínima no puede ser mayor a la máxima'); setLoading(false); return; }
      if (formData.images.length === 0) { setError('Debes agregar al menos una imagen'); setLoading(false); return; }


      const imagesForServer = formData.images.map(i => ({ name: i.name, dataUrl: i.dataUrl, isPrimary: !!i.isPrimary, contentType: i.contentType || null }));
      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price || 0),
        currency: formData.currency,
        categoryIds: Array.from(formData.categoryIds).map(x => parseInt(x)),
        platform: formData.platform,
        region: formData.region,
        minPurchaseQuantity: parseInt(formData.minPurchaseQuantity),
        maxPurchaseQuantity: parseInt(formData.maxPurchaseQuantity),
        releaseDate: formData.releaseDate || null,
        developer: formData.developer || null,
        publisher: formData.publisher || null,
        metacriticScore: formData.metacriticScore ? parseInt(formData.metacriticScore) : null,
        images: imagesForServer
      };

      if (product && product.id) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error guardando producto');
    } finally { setLoading(false); }
  };

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid">
        <h5 className="text-primary-light mb-0">{product ? 'Editar Producto' : 'Crear Nuevo Producto'}</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Título *</label>
              <input className="form-control bg-dark border-secondary text-white" value={formData.title} onChange={(e)=>setFormData({...formData, title:e.target.value})} required disabled={loading} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Precio (USD) *</label>
              <input type="number" step="0.01" min="0" className="form-control bg-dark border-secondary text-white" value={formData.price} onChange={(e)=>setFormData({...formData, price:e.target.value})} required disabled={loading} />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Plataforma *</label>
              <select className="form-select bg-dark border-secondary text-white" value={formData.platform} onChange={(e)=>setFormData({...formData, platform:e.target.value})} disabled={loading}>
                <option value="PC">PC</option><option value="PlayStation">PlayStation</option><option value="Xbox">Xbox</option>
                <option value="Nintendo Switch">Nintendo Switch</option><option value="Mobile">Mobile</option><option value="Multiplataforma">Multiplataforma</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Región *</label>
              <select className="form-select bg-dark border-secondary text-white" value={formData.region} onChange={(e)=>setFormData({...formData, region:e.target.value})} disabled={loading}>
                <option value="Global">Global</option><option value="North America">Norte América</option><option value="Europe">Europa</option><option value="Latin America">Latinoamérica</option><option value="Asia">Asia</option><option value="Oceania">Oceanía</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Cantidad mínima</label>
              <input type="number" min="1" className="form-control bg-dark border-secondary text-white" value={formData.minPurchaseQuantity} onChange={(e)=>setFormData({...formData, minPurchaseQuantity:e.target.value})} disabled={loading} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Cantidad máxima</label>
              <input type="number" min="1" className="form-control bg-dark border-secondary text-white" value={formData.maxPurchaseQuantity} onChange={(e)=>setFormData({...formData, maxPurchaseQuantity:e.target.value})} disabled={loading} />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Desarrollador</label>
              <input className="form-control bg-dark border-secondary text-white" value={formData.developer} onChange={(e)=>setFormData({...formData, developer:e.target.value})} disabled={loading} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Publicador</label>
              <input className="form-control bg-dark border-secondary text-white" value={formData.publisher} onChange={(e)=>setFormData({...formData, publisher:e.target.value})} disabled={loading} />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Fecha de lanzamiento</label>
              <input type="date" className="form-control bg-dark border-secondary text-white" value={formData.releaseDate} onChange={(e)=>setFormData({...formData, releaseDate:e.target.value})} disabled={loading} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-primary-light">Punt. Metacritic</label>
              <input type="number" min="0" max="100" className="form-control bg-dark border-secondary text-white" value={formData.metacriticScore} onChange={(e)=>setFormData({...formData, metacriticScore:e.target.value})} disabled={loading} />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label text-primary-light">Descripción</label>
              <textarea className="form-control bg-dark border-secondary text-white" rows="4" value={formData.description} onChange={(e)=>setFormData({...formData, description:e.target.value})} disabled={loading}></textarea>
            </div>

            <div className="col-12 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label text-primary-light mb-0">Imágenes del Producto *</label>
                <div>
                  <button type="button" className="btn btn-outline-primary btn-sm me-2" onClick={()=>setShowAddImage(s => !s)}>{showAddImage ? 'Cerrar' : 'Agregar imagen'}</button>
                  <small className="text-muted">Mínimo 1 imagen</small>
                </div>
              </div>

              {showAddImage && (
                <div className="card bg-dark border-secondary mb-3">
                  <div className="card-body">
                    <div className="row g-2 align-items-end">
                      <div className="col-md-4">
                        <label className="form-label text-primary-light small">Nombre *</label>
                        <input className="form-control bg-dark border-secondary text-white" value={newImg.name} onChange={(e)=>setNewImg({...newImg, name:e.target.value})} disabled={loading} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-primary-light small">Subir archivo</label>
                        <input type="file" accept="image/*" className="form-control bg-dark border-secondary text-white" ref={newFileRef} onChange={(e)=>setNewImg({...newImg, file: e.target.files[0] || null})} disabled={loading} />
                      </div>
                      <div className="col-12 mt-2">
                        <button type="button" className="btn btn-outline-primary btn-sm me-2" onClick={addImage} disabled={loading || (!newImg.file && !newImg.url.trim()) || !newImg.name.trim()}>Agregar</button>
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={()=>{ setNewImg({ name:'', file:null, url:'' }); if (newFileRef.current) newFileRef.current.value = ''; setShowAddImage(false); }}>Cancelar</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="image-list">
                {formData.images.map(img => (
                  <div className="image-card card bg-dark border-secondary" key={img.id}>
                    <div className="image-preview" style={{ backgroundImage: `url(${img.dataUrl})` }} />
                    <div className="card-body p-2">
                      <input className="form-control form-control-sm bg-dark border-secondary text-white mb-2" value={img.name} onChange={(e)=>renameImage(img.id, e.target.value)} disabled={loading} />
                      <div className="d-flex gap-2">
                        {img.isPrimary ? <span className="btn btn-success btn-sm disabled"><i className="fas fa-star me-1"></i>Principal</span> : <button type="button" className="btn btn-outline-warning btn-sm" onClick={()=>setPrimary(img)} disabled={loading}><i className="fas fa-star me-1"></i>Principal</button>}
                        <input type="file" accept="image/*" style={{display:'none'}} ref={el => replaceFileRefs.current[img.id] = el} onChange={(e)=>replaceFile(img.id, e.target.files[0])} />
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={()=>replaceFileRefs.current[img.id]?.click()} disabled={loading}>Reemplazar</button>
                        {formData.images.length > 1 && <button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>requestDeleteImage(img)} disabled={loading}><i className="fas fa-trash"></i></button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            <div className="col-12 mb-3">
              <label className="form-label text-primary-light">Categorías *</label>
              <div className="d-flex flex-wrap gap-3">
                {categories.map(cat => (
                  <div key={cat.id} className="form-check">
                    <input className="form-check-input" type="checkbox" id={`cat-${cat.id}`} checked={formData.categoryIds.has(String(cat.id))} onChange={()=> {
                      setFormData(prev => { const s = new Set(prev.categoryIds); if (s.has(String(cat.id))) s.delete(String(cat.id)); else s.add(String(cat.id)); return { ...prev, categoryIds: s };});
                    }} disabled={loading} />
                    <label htmlFor={`cat-${cat.id}`} className="form-check-label text-white">{cat.description}</label>
                  </div>
                ))}
              </div>
              {formData.categoryIds.size === 0 && <small className="text-danger">Selecciona al menos una categoría</small>}
            </div>

          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading || formData.categoryIds.size === 0 || formData.images.length === 0}>
              {loading ? (<><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>) : (product ? 'Actualizar Producto' : 'Crear Producto')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onSuccess} disabled={loading}>Cancelar</button>
          </div>
        </form>

        <ConfirmModal show={confirm.show} title={confirm.title} message={confirm.message} onConfirm={()=>{ confirm.onConfirm && confirm.onConfirm(); }} onCancel={closeConfirm} confirmText="Eliminar" cancelText="Cancelar" />
      </div>
    </div>
  );
}
