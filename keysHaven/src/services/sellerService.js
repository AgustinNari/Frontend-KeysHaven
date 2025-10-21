import { mockProducts, mockCategories, mockDigitalKeys, mockSellerDiscounts, mockOrders, mockUsers } from '../data/mockData';

const delay = (ms) => new Promise(res => setTimeout(res, ms));
const _genId = (prefix='') => Date.now() + Math.floor(Math.random()*1000);


function _generateCode(prefix = 'CPN') {
  return `${prefix}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}
let sellerProducts = mockProducts
  .filter(p => p.sellerId === 2)
  .map(p => {
    const images = (p.imageUrls || []).map((url, idx) => ({
      id: _genId('img'),
      productId: p.id,
      name: `Imagen ${idx+1}`,
      isPrimary: idx === 0,
      dataUrl: url,
      contentType: null
    }));
    return { ...p, images };
  });

let digitalKeys = [...mockDigitalKeys];
let sellerDiscounts = [...mockSellerDiscounts];

export const getSellerProducts = async () => { await delay(300); return sellerProducts.map(p=> ({ ...p, images: (p.images||[]).map(i=>({...i})) })); };

export const createProduct = async (productData) => {
  await delay(400);
  const imagesInput = productData.images || productData.imageUrls || [];
  if (!Array.isArray(imagesInput) || imagesInput.length === 0) throw new Error('El producto debe tener al menos una imagen');

  const newId = _genId('prod');
  const images = imagesInput.map((img, idx) => ({
    id: _genId('img'),
    productId: newId,
    name: img.name || `Imagen ${idx+1}`,
    isPrimary: !!img.isPrimary || idx === 0,
    dataUrl: img.dataUrl || img.url || img,
    contentType: img.contentType || null
  }));
  if (!images.some(i=>i.isPrimary)) images[0].isPrimary = true;
  if (images.filter(i=>i.isPrimary).length > 1) {
    let found=false;
    images.forEach(im => { if (im.isPrimary){ if (!found) found=true; else im.isPrimary=false }});
  }

  const newProduct = {
    id: newId, sellerId: 2, sellerDisplayName: "Sofía Ramírez",
    sku: productData.sku || null,
    title: productData.title || '',
    description: productData.description || '',
    price: productData.price || 0, currency: productData.currency || 'USD',
    categories: (productData.categoryIds || []).map(id => ({ id })),
    platform: productData.platform || 'PC', region: productData.region || 'Global',
    minPurchaseQuantity: productData.minPurchaseQuantity || 1,
    maxPurchaseQuantity: productData.maxPurchaseQuantity || 10,
    releaseDate: productData.releaseDate || null,
    developer: productData.developer || null, publisher: productData.publisher || null,
    metacriticScore: productData.metacriticScore ?? null,
    availableStock: productData.availableStock ?? 0, featured: productData.featured ?? false,
    active: productData.active ?? true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    images
  };

  sellerProducts.push(newProduct);
  return { ...newProduct, images: newProduct.images.map(i=>({...i})) };
};

export const updateProduct = async (productId, productData) => {
  await delay(300);
  const idx = sellerProducts.findIndex(p => p.id === productId);
  if (idx === -1) throw new Error('Producto no encontrado');

  if (Array.isArray(productData.images)) {
    const imgs = productData.images.map((img,i) => ({
      id: img.id || _genId('img'),
      productId,
      name: img.name || `Imagen ${i+1}`,
      isPrimary: !!img.isPrimary,
      dataUrl: img.dataUrl || img.url || img,
      contentType: img.contentType || null
    }));
    if (!imgs.some(x=>x.isPrimary) && imgs.length>0) imgs[0].isPrimary=true;
    productData = { ...productData, images: imgs };
  }
  sellerProducts[idx] = { ...sellerProducts[idx], ...productData, updatedAt: new Date().toISOString() };
  return { ...sellerProducts[idx], images: sellerProducts[idx].images.map(i=>({...i})) };
};

export const deleteProduct = async (productId) => {
  await delay(250);
  const idx = sellerProducts.findIndex(p => p.id === productId);
  if (idx === -1) throw new Error('Producto no encontrado');
  sellerProducts[idx].active = false;
  sellerProducts[idx].updatedAt = new Date().toISOString();
  return { success: true, product: { ...sellerProducts[idx] } };
};


export const addProductImage = async (productId, { name, dataUrl, contentType }) => {
  await delay(250);
  const pIdx = sellerProducts.findIndex(p=>p.id===productId);
  if (pIdx === -1) throw new Error('Producto no encontrado');
  const imgs = sellerProducts[pIdx].images || [];
  const newImg = { id: _genId('img'), productId, name: name || `Imagen ${imgs.length+1}`, isPrimary: imgs.length===0, dataUrl, contentType: contentType || null };
  if (newImg.isPrimary) imgs.forEach(i=> i.isPrimary=false);
  imgs.push(newImg);
  sellerProducts[pIdx].images = imgs;
  sellerProducts[pIdx].updatedAt = new Date().toISOString();
  return { ...newImg };
};

export const updateProductImage = async (productId, imageId, { name, isPrimary, dataUrl, contentType }) => {
  await delay(250);
  const pIdx = sellerProducts.findIndex(p=>p.id===productId);
  if (pIdx === -1) throw new Error('Producto no encontrado');
  const imgs = sellerProducts[pIdx].images || [];
  const iIdx = imgs.findIndex(i=>i.id===imageId);
  if (iIdx === -1) throw new Error('Imagen no encontrada');
  if (typeof name === 'string') imgs[iIdx].name = name;
  if (typeof dataUrl === 'string' && dataUrl.trim() !== '') { imgs[iIdx].dataUrl = dataUrl; imgs[iIdx].contentType = contentType || imgs[iIdx].contentType || null; }
  if (typeof isPrimary === 'boolean') {
    if (isPrimary) imgs.forEach((im,ii)=> imgs[ii].isPrimary = (im.id === imageId));
    else { imgs[iIdx].isPrimary = false; if (!imgs.some(im=>im.isPrimary) && imgs.length>0) imgs[0].isPrimary = true; }
  }
  sellerProducts[pIdx].images = imgs;
  sellerProducts[pIdx].updatedAt = new Date().toISOString();
  return { ...imgs[iIdx] };
};

export const deleteProductImage = async (productId, imageId) => {
  await delay(200);
  const pIdx = sellerProducts.findIndex(p=>p.id===productId);
  if (pIdx === -1) throw new Error('Producto no encontrado');
  const imgs = sellerProducts[pIdx].images || [];
  if (imgs.length <= 1) throw new Error('No se puede eliminar la última imagen del producto');
  const iIdx = imgs.findIndex(i=>i.id===imageId);
  if (iIdx === -1) throw new Error('Imagen no encontrada');
  const removed = imgs.splice(iIdx,1)[0];
  if (removed.isPrimary && imgs.length>0) imgs[0].isPrimary = true;
  sellerProducts[pIdx].images = imgs;
  sellerProducts[pIdx].updatedAt = new Date().toISOString();
  return { success: true, deletedImageId: removed.id };
};


export const getCategories = async () => { await delay(200); return mockCategories; };
export const getSellerStats = async () => { await delay(300); return { totalSales:45, totalRevenue:2245.5, activeProducts: sellerProducts.filter(p=>p.active).length, totalProducts: sellerProducts.length, averageRating:4.7, pendingOrders:3 }; };
export const getSellerOrders = async () => { await delay(300); return mockOrders; };
export const addDigitalKey = async (keyData) => { await delay(200); const newKey={ id: _genId('key'), ...keyData, used:false, createdAt: new Date().toISOString() }; digitalKeys.push(newKey); return newKey; };
export const addBulkDigitalKeys = async (bulkKeyData) => { await delay(400); const newKeys = bulkKeyData.keyCodes.map((k,i)=>({ id:_genId('key')+i, productId: bulkKeyData.productId, keyCode: k, used:false, createdAt: new Date().toISOString() })); digitalKeys.push(...newKeys); return { success:true, keys: newKeys, count: newKeys.length }; };
export const getProductKeys = async (productId) => { await delay(250); return digitalKeys.filter(k=>k.productId===parseInt(productId)); };






const SELLER_ID = 2;


export const getSellerDiscounts = async () => {
  await delay(250);

  return sellerDiscounts.map(d => ({ ...d }));
};

export const createDiscount = async (discountData) => {
  await delay(300);


  const allowedScopes = ['PRODUCT', 'SELLER'];
  const allowedTypes = ['PERCENT', 'FIXED'];

  if (!discountData || !discountData.type || !allowedTypes.includes(discountData.type)) {
    throw new Error('Tipo de descuento inválido (PERCENT o FIXED)');
  }
  if (!discountData.scope || !allowedScopes.includes(discountData.scope)) {
    throw new Error('Scope inválido. Para sellers solo se permiten PRODUCT o SELLER');
  }

  const payload = { ...discountData };


  payload.value = payload.value !== undefined && payload.value !== null ? Number(payload.value) : 0;

  if (payload.type === 'PERCENT') {
    if (Number.isNaN(payload.value) || payload.value < 0 || payload.value > 100) {
      throw new Error('Valor de porcentaje inválido (0-100)');
    }
    payload.code = payload.code ? String(payload.code).toUpperCase() : null;
    payload.targetBuyerId = null;
  } else {
    if (!payload.code || String(payload.code).trim() === '') {
      payload.code = _generateCode('CPN');
    } else {
      payload.code = String(payload.code).toUpperCase();
    }


    if (!payload.targetBuyerId) {
      const buyer = (mockUsers || []).find(u => u.role === 'BUYER' && u.id !== SELLER_ID);
      if (!buyer) throw new Error('No hay compradores disponibles para asignar el cupón (mock)');
      payload.targetBuyerId = buyer.id;
    } else {

      if (payload.targetBuyerId === SELLER_ID) {
        throw new Error('No puedes asignar un cupón a ti mismo');
      }
    }

    payload.value = Number(payload.value || 0);
    if (Number.isNaN(payload.value) || payload.value < 0) throw new Error('Valor de monto fijo inválido');
  }


  if (payload.scope === 'PRODUCT') {
    if (!payload.targetProductId) throw new Error('Debe seleccionar un producto objetivo cuando el scope es PRODUCT');

    const productOk = (mockProducts || []).find(p => p.id === Number(payload.targetProductId) && p.sellerId === SELLER_ID);
    if (!productOk) throw new Error('Producto inválido o no pertenece a este vendedor (mock)');
  } else if (payload.scope === 'SELLER') {

    payload.targetSellerId = SELLER_ID;
    payload.targetProductId = null;
  }

  payload.id = _genId('d');
  payload.active = true;
  payload.createdAt = new Date().toISOString();
  payload.startsAt = payload.startsAt ?? null;
  payload.endsAt = payload.endsAt ?? null;
  payload.expiresAt = payload.expiresAt ?? null;

  sellerDiscounts.push(payload);
  return { ...payload };
};

export const updateDiscount = async (discountId, discountData) => {
  await delay(300);
  const idx = sellerDiscounts.findIndex(d => d.id === discountId);
  if (idx === -1) throw new Error('Descuento no encontrado');

  const existing = { ...sellerDiscounts[idx] };
  const next = { ...existing, ...discountData };


  if (next.scope && !['PRODUCT','SELLER'].includes(next.scope)) {
    throw new Error('Scope inválido. Sellers solo pueden PRODUCT o SELLER');
  }


  if (next.type === 'PERCENT') {
    next.code = null;
    next.targetBuyerId = null;
    next.value = Number(next.value);
    if (Number.isNaN(next.value) || next.value < 0 || next.value > 100) throw new Error('Valor de porcentaje inválido');
  } else if (next.type === 'FIXED') {

    next.value = Number(next.value || 0);
    if (Number.isNaN(next.value) || next.value < 0) throw new Error('Valor de monto fijo inválido');

    if (!next.code || String(next.code).trim() === '') next.code = _generateCode('CPN');

    if (!next.targetBuyerId) {
      const buyer = (mockUsers || []).find(u => u.role === 'BUYER' && u.id !== SELLER_ID);
      if (!buyer) throw new Error('No hay compradores disponibles (mock)');
      next.targetBuyerId = buyer.id;
    } else if (next.targetBuyerId === SELLER_ID) {
      throw new Error('No puedes asignar un cupón a ti mismo');
    }
  } else {
    throw new Error('Tipo de descuento inválido');
  }


  if (next.scope === 'PRODUCT') {
    if (!next.targetProductId) throw new Error('Debe seleccionar producto objetivo cuando scope = PRODUCT');
    const prodOk = (mockProducts || []).find(p => p.id === Number(next.targetProductId) && p.sellerId === SELLER_ID);
    if (!prodOk) throw new Error('Producto inválido o no pertenece a este vendedor (mock)');
    next.targetSellerId = null;
  } else if (next.scope === 'SELLER') {
    next.targetSellerId = SELLER_ID;
    next.targetProductId = null;
  }

  if (typeof discountData.active === 'boolean') next.active = discountData.active;

  sellerDiscounts[idx] = { ...next };
  return { ...sellerDiscounts[idx] };
};