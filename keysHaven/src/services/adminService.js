import { 
  mockUsers, 
  mockProducts, 
  mockCategories, 
  mockDiscounts,
  mockPlatformMetrics,
  mockRecentActivity 
} from '../data/mockData';

// Función para simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Estado en memoria para desarrollo
let users = [...mockUsers];
let products = [...mockProducts];
let categories = [...mockCategories];
let discounts = [...mockDiscounts];

// Servicios para Admin - Usuarios
export const getUsers = async () => {
  await delay(500);
  return users;
};

export const updateUser = async (userId, userData) => {
  await delay(300);
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...userData };
    return users[userIndex];
  }
  throw new Error('Usuario no encontrado');
};

export const deleteUser = async (userId) => {
  await delay(300);
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    return { success: true };
  }
  throw new Error('Usuario no encontrado');
};

// Servicios para Admin - Productos
export const getAllProducts = async () => {
  await delay(500);
  return products;
};

export const updateProduct = async (productId, productData) => {
  await delay(300);
  const productIndex = products.findIndex(product => product.id === productId);
  if (productIndex !== -1) {
    products[productIndex] = { ...products[productIndex], ...productData };
    return products[productIndex];
  }
  throw new Error('Producto no encontrado');
};

export const deleteProduct = async (productId) => {
  await delay(300);
  const productIndex = products.findIndex(product => product.id === productId);
  if (productIndex !== -1) {
    products.splice(productIndex, 1);
    return { success: true };
  }
  throw new Error('Producto no encontrado');
};

// Servicios para Admin - Categorías
export const getCategories = async () => {
  await delay(300);
  return categories;
};

export const createCategory = async (categoryData) => {
  await delay(300);
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
  await delay(300);
  const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
  if (categoryIndex !== -1) {
    categories[categoryIndex] = { ...categories[categoryIndex], ...categoryData };
    return categories[categoryIndex];
  }
  throw new Error('Categoría no encontrada');
};

export const deleteCategory = async (categoryId) => {
  await delay(300);
  const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
  if (categoryIndex !== -1) {
    categories.splice(categoryIndex, 1);
    return { success: true };
  }
  throw new Error('Categoría no encontrada');
};

// Servicios para Admin - Descuentos
export const getDiscounts = async () => {
  await delay(500);
  return discounts;
};

export const createDiscount = async (discountData) => {
  await delay(300);
  const newDiscount = {
    id: Date.now(),
    ...discountData,
    active: true,
    createdAt: new Date().toISOString()
  };
  discounts.push(newDiscount);
  return newDiscount;
};

export const updateDiscount = async (discountId, discountData) => {
  await delay(300);
  const discountIndex = discounts.findIndex(discount => discount.id === discountId);
  if (discountIndex !== -1) {
    discounts[discountIndex] = { ...discounts[discountIndex], ...discountData };
    return discounts[discountIndex];
  }
  throw new Error('Descuento no encontrado');
};

export const deleteDiscount = async (discountId) => {
  await delay(300);
  const discountIndex = discounts.findIndex(discount => discount.id === discountId);
  if (discountIndex !== -1) {
    discounts.splice(discountIndex, 1);
    return { success: true };
  }
  throw new Error('Descuento no encontrado');
};

// Servicios para Admin Dashboard
export const getAdminStats = async () => {
  await delay(500);
  return {
    totalUsers: users.length,
    totalProducts: products.length,
    totalOrders: 423,
    totalRevenue: 21500.75,
    activeSellers: users.filter(user => user.role === 'SELLER' && user.active).length,
    pendingReviews: 12
  };
};

export const getPlatformMetrics = async () => {
  await delay(300);
  return mockPlatformMetrics;
};

export const getRecentActivity = async () => {
  await delay(400);
  return mockRecentActivity;
};