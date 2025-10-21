import { 
  mockUsers, 
  mockProducts, 
  mockCategories, 
  mockDiscounts,
  mockPlatformMetrics,
  mockRecentActivity 
} from '../data/mockData';


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


let users = [...mockUsers];
let products = [...mockProducts];
let categories = [...mockCategories];
let discounts = [...mockDiscounts];


let reviews = [

  { id: 1, productId: products[0]?.id ?? 1, buyerId: users.find(u=>u.role==='BUYER')?.id ?? 2, rating: 5, title: 'Excelente', comment: 'Muy buen producto', visible: true, createdAt: new Date().toISOString() },
  { id: 2, productId: products[0]?.id ?? 1, buyerId: users.find(u=>u.role==='BUYER')?.id ?? 3, rating: 2, title: 'Malo', comment: 'Llegó roto', visible: true, createdAt: new Date().toISOString() },
];


export const getUsers = async () => {
  await delay(350);
  return users;
};


export const updateUser = async (userId, userData) => {
  await delay(250);
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('Usuario no encontrado');


  const allowed = {};
  if (typeof userData.active === 'boolean') allowed.active = userData.active;
  if (userData.role) allowed.role = userData.role;

  users[idx] = { ...users[idx], ...allowed };
  return users[idx];
};


export const deleteUser = async (userId) => {
  await delay(200);
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('Usuario no encontrado');
  users[idx] = { ...users[idx], active: false };
  return { success: true };
};


export const getAllProducts = async () => {
  await delay(400);
  return products;
};

export const updateProduct = async (productId, productData) => {
  await delay(300);
  const i = products.findIndex(p => p.id === productId);
  if (i === -1) throw new Error('Producto no encontrado');
  products[i] = { ...products[i], ...productData, updatedAt: new Date().toISOString() };
  return products[i];
};


export const deleteProduct = async (productId) => {
  await delay(200);
  const i = products.findIndex(p => p.id === productId);
  if (i === -1) throw new Error('Producto no encontrado');
  products[i] = { ...products[i], active: false };
  return { success: true };
};


export const getCategories = async () => {
  await delay(250);
  return categories;
};

export const createCategory = async (categoryData) => {
  await delay(250);
  const newCategory = {
    id: Date.now(),
    ...categoryData,
    productCount: 0,
    featured: false
  };
  categories.push(newCategory);
  return newCategory;
};

export const updateCategory = async (categoryId, categoryData) => {
  await delay(250);
  const idx = categories.findIndex(c => c.id === categoryId);
  if (idx === -1) throw new Error('Categoría no encontrada');
  categories[idx] = { ...categories[idx], ...categoryData };
  return categories[idx];
};

export const deleteCategory = async (categoryId) => {
  await delay(200);
  const idx = categories.findIndex(c => c.id === categoryId);
  if (idx === -1) throw new Error('Categoría no encontrada');
  categories.splice(idx, 1);
  return { success: true };
};


function _generateCode(prefix = 'C') {
  const s = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}${s}`;
}

export const getDiscounts = async () => {
  await delay(350);
  return discounts;
};

export const createDiscount = async (discountData) => {
  await delay(300);

  if (!discountData.type) throw new Error('Tipo de descuento requerido');
  if (!discountData.scope || discountData.scope !== 'CATEGORY') throw new Error('Para admin solo se permiten descuentos con scope = CATEGORY');

  const type = discountData.type; // 'PERCENT' o 'FIXED'
  const payload = { ...discountData };

  if (type === 'PERCENT') {
    const v = Number(payload.value);
    if (Number.isNaN(v) || v < 0 || v > 100) throw new Error('Valor de porcentaje inválido');
    payload.code = payload.code ? payload.code.toUpperCase() : null;
    payload.targetBuyerId = null;
  } else if (type === 'FIXED') {
    if (!payload.targetBuyerId) {
      const adminCandidate = users.find(u => u.role === 'ADMIN');
      const adminId = adminCandidate ? adminCandidate.id : null;
      const buyer = users.find(u => u.role === 'BUYER' && u.id !== adminId);
      if (!buyer) throw new Error('No hay compradores disponibles para asignar el cupón (mock)');
      payload.targetBuyerId = buyer.id;
    }
    if (!payload.code || String(payload.code).trim() === '') {
      payload.code = _generateCode('CPN');
    } else {
      payload.code = String(payload.code).toUpperCase();
    }
    payload.value = Number(payload.value || 0);
  } else {
    throw new Error('Tipo de descuento desconocido');
  }

  payload.id = Date.now();
  payload.active = true;
  payload.createdAt = new Date().toISOString();
  payload.expiresAt = payload.expiresAt ?? null;

  discounts.push(payload);
  return payload;
};

export const updateDiscount = async (discountId, discountData) => {
  await delay(250);
  const idx = discounts.findIndex(d => d.id === discountId);
  if (idx === -1) throw new Error('Descuento no encontrado');

  const existing = discounts[idx];


  if (discountData.scope && discountData.scope !== 'CATEGORY') {
    throw new Error('Admin solo puede usar scope = CATEGORY');
  }


  const next = { ...existing, ...discountData };

  if (next.type === 'PERCENT') {
    next.code = null;
    next.targetBuyerId = null;
    next.value = Number(next.value);
    if (Number.isNaN(next.value) || next.value < 0 || next.value > 100) throw new Error('Valor de porcentaje inválido');
  } else if (next.type === 'FIXED') {
    if (!next.targetBuyerId) {

      const adminId = users.find(u => u.role === 'ADMIN')?.id;
      const buyer = users.find(u => u.role === 'BUYER' && u.id !== adminId);
      if (!buyer) throw new Error('No hay buyers para asignar el cupón (mock)');
      next.targetBuyerId = buyer.id;
    }
    if (!next.code) next.code = _generateCode('CPN');
    next.value = Number(next.value || 0);
  }


  if (typeof discountData.active === 'boolean') next.active = discountData.active;

  discounts[idx] = next;
  return discounts[idx];
};


export const deleteDiscount = async (discountId) => {
  await delay(200);
  const idx = discounts.findIndex(d => d.id === discountId);
  if (idx === -1) throw new Error('Descuento no encontrado');
  discounts[idx] = { ...discounts[idx], active: false };
  return { success: true };
};


export const getAdminStats = async () => {
  await delay(300);
  return {
    totalUsers: users.length,
    totalProducts: products.length,
    totalOrders: 423,
    totalRevenue: 21500.75,
    activeSellers: users.filter(user => user.role === 'SELLER' && user.active).length,
    pendingReviews: reviews.filter(r => r.visible === false).length
  };
};

export const getPlatformMetrics = async () => {
  await delay(200);
  return mockPlatformMetrics;
};

export const getRecentActivity = async () => {
  await delay(200);
  return mockRecentActivity;
};


export const getAllReviews = async (opts = {}) => {
  await delay(300);
  return reviews.slice();
};

export const toggleReviewVisibility = async (reviewId, visible) => {
  await delay(200);
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx === -1) throw new Error('Reseña no encontrada');
  reviews[idx] = { ...reviews[idx], visible };
  return reviews[idx];
};
