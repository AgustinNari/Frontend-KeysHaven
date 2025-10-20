import { 
  mockProducts, 
  mockCategories, 
  mockDigitalKeys, 
  mockSellerDiscounts,
  mockOrders 
} from '../data/mockData';

// Función para simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Estado en memoria para desarrollo (solo productos del seller)
let sellerProducts = mockProducts.filter(p => p.sellerId === 2);
let digitalKeys = [...mockDigitalKeys];
let sellerDiscounts = [...mockSellerDiscounts];

// Servicios para Seller - Productos
export const getSellerProducts = async () => {
  await delay(500);
  return sellerProducts;
};

export const createProduct = async (productData) => {
  await delay(500);
  const newProduct = {
    id: Date.now(),
    sellerId: 2,
    sellerDisplayName: "Sofía Ramírez",
    ...productData,
    active: true,
    availableStock: 0,
    featured: false,
    imageUrls: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  sellerProducts.push(newProduct);
  return newProduct;
};

export const updateProduct = async (productId, productData) => {
  await delay(300);
  const productIndex = sellerProducts.findIndex(product => product.id === productId);
  if (productIndex !== -1) {
    sellerProducts[productIndex] = { 
      ...sellerProducts[productIndex], 
      ...productData,
      updatedAt: new Date().toISOString()
    };
    return sellerProducts[productIndex];
  }
  throw new Error('Producto no encontrado');
};

export const deleteProduct = async (productId) => {
  await delay(300);
  const productIndex = sellerProducts.findIndex(product => product.id === productId);
  if (productIndex !== -1) {
    sellerProducts.splice(productIndex, 1);
    return { success: true };
  }
  throw new Error('Producto no encontrado');
};

// Servicios para Seller - Categorías
export const getCategories = async () => {
  await delay(300);
  return mockCategories;
};

// Servicios para Seller - Dashboard
export const getSellerStats = async (timeRange = 'month') => {
  await delay(500);
  return {
    totalSales: 45,
    totalRevenue: 2245.50,
    activeProducts: sellerProducts.filter(p => p.active).length,
    totalProducts: sellerProducts.length,
    averageRating: 4.7,
    pendingOrders: 3
  };
};

export const getSellerOrders = async (params = {}) => {
  await delay(500);
  return mockOrders;
};

// Servicios para Seller - Claves Digitales
export const addDigitalKey = async (keyData) => {
  await delay(300);
  const newKey = {
    id: Date.now(),
    ...keyData,
    used: false,
    createdAt: new Date().toISOString()
  };
  digitalKeys.push(newKey);
  return newKey;
};

export const addBulkDigitalKeys = async (bulkKeyData) => {
  await delay(500);
  const newKeys = bulkKeyData.keyCodes.map((keyCode, index) => ({
    id: Date.now() + index,
    productId: bulkKeyData.productId,
    keyCode: keyCode,
    used: false,
    createdAt: new Date().toISOString()
  }));
  digitalKeys.push(...newKeys);
  return { success: true, keys: newKeys, count: newKeys.length };
};

export const getProductKeys = async (productId) => {
  await delay(300);
  return digitalKeys.filter(key => key.productId === parseInt(productId));
};

// Servicios para Seller - Descuentos
export const createDiscount = async (discountData) => {
  await delay(300);
  const newDiscount = {
    id: Date.now(),
    ...discountData,
    active: true,
    createdAt: new Date().toISOString()
  };
  sellerDiscounts.push(newDiscount);
  return newDiscount;
};

export const getSellerDiscounts = async () => {
  await delay(300);
  return sellerDiscounts;
};

export const updateDiscount = async (discountId, discountData) => {
  await delay(300);
  const discountIndex = sellerDiscounts.findIndex(discount => discount.id === discountId);
  if (discountIndex !== -1) {
    sellerDiscounts[discountIndex] = { ...sellerDiscounts[discountIndex], ...discountData };
    return sellerDiscounts[discountIndex];
  }
  throw new Error('Descuento no encontrado');
};