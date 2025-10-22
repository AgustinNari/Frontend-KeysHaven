import apiClient from "../api/apiClient";


const extractContentIfPage = (maybePage) => {
  if (!maybePage) return maybePage;
  if (Array.isArray(maybePage)) return maybePage;
  if (typeof maybePage === "object" && Array.isArray(maybePage.content)) return maybePage.content;
  return maybePage;
};


const tryEndpoints = async (paths, opts = {}) => {
  if (typeof paths === "string") paths = [paths];
  if (!Array.isArray(paths)) throw new Error("tryEndpoints: paths must be string or array");

  let lastErr = null;
  for (const p of paths) {
    try {
      const r = await apiClient.apiFetch(p, opts);
      return r;
    } catch (err) {
      lastErr = err;

      if (err && (err.status === 401 || err.status === 403)) {
        throw err;
      }

    }
  }
  throw lastErr;
};


const candidatesDefault = (path) => {
  if (path.startsWith('/api/v1')) return [path, path.replace('/api/v1', '')];
  return [path, `/api/v1${path}`];
};
const candidatesPreferApiV1 = (path) => {
  if (path.startsWith('/api/v1')) return [path, path.replace('/api/v1', '')];
  return [`/api/v1${path}`, path];
};


export const getUsers = async () => {
  const resp = await tryEndpoints(candidatesDefault(`/users?page=0&size=2147483647`), { method: "GET" });
  return extractContentIfPage(resp);
};

export const updateUser = async (userId, userData) => {
  if (typeof userData.active === "boolean") {
    return tryEndpoints(candidatesDefault(`/users/${userId}/active?active=${userData.active}`), { method: "PATCH" });
  }
  return tryEndpoints(candidatesDefault(`/users/${userId}`), { method: "PUT", body: JSON.stringify(userData) });
};

export const deleteUser = async (userId) => {
  return updateUser(userId, { active: false });
};


export const getAllProducts = async () => {
  const qs = `?page=0&size=2147483647`;
  const resp = await tryEndpoints(candidatesPreferApiV1(`/products/filtered/all${qs}`), { method: "GET" });
  return extractContentIfPage(resp);
};

export const updateProduct = async (productId, productData) => {

  if (typeof productData.featured === "boolean") {
    return tryEndpoints(candidatesDefault(`/products/${productId}/featured?featured=${productData.featured}`), { method: "PATCH" });
  }

  if (typeof productData.active === "boolean") {
    return tryEndpoints(candidatesDefault(`/products/${productId}/active?active=${productData.active}`), { method: "PATCH" });
  }
  return tryEndpoints(candidatesDefault(`/products/${productId}`), { method: "PUT", body: JSON.stringify(productData) });
};

export const deleteProduct = async (productId) => {

  return tryEndpoints(candidatesDefault(`/products/${productId}/active?active=false`), { method: "PATCH" });
};


export const getCategories = async () => {
  const resp = await tryEndpoints(candidatesDefault(`/categories?page=0&size=2147483647`), { method: "GET" });
  return extractContentIfPage(resp);
};

export const createCategory = async (categoryData) => {
  return tryEndpoints(candidatesDefault(`/categories`), { method: "POST", body: JSON.stringify(categoryData) });
};

export const updateCategory = async (categoryId, categoryData) => {
  if (typeof categoryData.featured === "boolean") {
    return tryEndpoints(candidatesDefault(`/categories/${categoryId}/featured?featured=${categoryData.featured}`), { method: "PATCH" });
  }
  return tryEndpoints(candidatesDefault(`/categories/${categoryId}`), { method: "PUT", body: JSON.stringify(categoryData) });
};

export const deleteCategory = async (categoryId) => {
  return tryEndpoints(candidatesDefault(`/categories/${categoryId}`), { method: "DELETE" });
};

export const getDiscounts = async () => {
  const resp = await tryEndpoints(candidatesDefault(`/discounts/admin/categories?page=0&size=2147483647`), { method: "GET" });
  return extractContentIfPage(resp);
};

export const createDiscount = async (discountData) => {
  return tryEndpoints(candidatesDefault(`/discounts`), { method: "POST", body: JSON.stringify(discountData) });
};

export const updateDiscount = async (discountId, discountData) => {
  return tryEndpoints(candidatesDefault(`/discounts/${discountId}`), { method: "PUT", body: JSON.stringify(discountData) });
};

export const deleteDiscount = async (discountId) => {
  return updateDiscount(discountId, { active: false });
};


export const getAllReviews = async () => {
  const resp = await tryEndpoints(candidatesDefault(`/reviews?page=0&size=2147483647`), { method: "GET" });
  return extractContentIfPage(resp);
};

export const toggleReviewVisibility = async (reviewId, visible) => {
  return tryEndpoints(candidatesDefault(`/reviews/${reviewId}/visibility?visible=${visible}`), { method: "PATCH" });
};


export const getAdminStats = async () => {
  try {
    const [users, products, reviews] = await Promise.all([getUsers(), getAllProducts(), getAllReviews()]);

    const totalUsers = Array.isArray(users) ? users.length : (users?.length ?? 0);
    const totalProducts = Array.isArray(products) ? products.length : (products?.length ?? 0);
    const totalOrders = 0;
    const totalRevenue = 0;
    const activeSellers = Array.isArray(products) ? new Set((products || []).map(p => p.sellerId).filter(Boolean)).size : 0;
    const pendingReviews = Array.isArray(reviews) ? (reviews.filter(r => (typeof r.visible !== "undefined") ? !r.visible : false).length) : 0;

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      activeSellers,
      pendingReviews
    };
  } catch (err) {
    console.error("getAdminStats error:", err);
    return {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      activeSellers: 0,
      pendingReviews: 0
    };
  }
};

export const getPlatformMetrics = async () => {
  try {
    const [users, products, reviews] = await Promise.all([getUsers(), getAllProducts(), getAllReviews()]);
    let platformRating = 0;
    if (Array.isArray(reviews) && reviews.length > 0) {
      const ratings = reviews.map(r => r.rating).filter(r => typeof r === 'number');
      platformRating = ratings.length ? (ratings.reduce((a,b)=>a+b,0) / ratings.length) : 0;
      platformRating = Math.round(platformRating * 10) / 10;
    }
    return {
      uptime: 99.9,
      responseTime: 0.2,
      dailyVisits: Math.min(100000, Math.max(0, (users || []).length * 2)),
      platformRating,
      activeSupport: 5,
      incidents: 0
    };
  } catch (err) {
    console.error("getPlatformMetrics error:", err);
    return { uptime: 99, responseTime: 0.2, dailyVisits: 0, platformRating: 0, activeSupport: 0, incidents: 0 };
  }
};

export const getRecentActivity = async () => {
  try {
    const [users, reviews, products] = await Promise.all([getUsers(), getAllReviews(), getAllProducts()]);

    const activities = [];

    if (Array.isArray(users)) {
      users.slice(-10).forEach(u => {
        const time = u.createdAt ?? u.lastLogin ?? null;
        activities.push({
          id: `user-${u.id}`,
          type: 'user',
          action: 'Registro de nuevo usuario',
          user: `${(u.displayName ?? '')} ${(u.firstName ?? '')} ${(u.lastName ?? '').trim() || 'User ' + u.id}`,
          product: null,
          amount: null,
          time
        });
      });
    }

    if (Array.isArray(reviews)) {
      reviews.slice(-20).forEach(r => {
        activities.push({
          id: `review-${r.id}`,
          type: 'review',
          action: `Reseña (${r.rating ?? '—'}★)`,
          user: `Buyer ${r.buyerId}`,
          product: `Producto ${r.productId}`,
          amount: null,
          time: r.createdAt ?? null
        });
      });
    }

    if (Array.isArray(products)) {
      products.slice(-10).forEach(p => {
        const time = p.createdAt ?? p.updatedAt ?? null;
        activities.push({
          id: `product-${p.id}`,
          type: 'product',
          action: 'Producto creado/actualizado',
          user: p.sellerDisplayName ?? `Seller ${p.sellerId}`,
          product: p.title ?? `#${p.id}`,
          amount: null,
          time
        });
      });
    }

    const withTime = activities.filter(a => a.time);
    withTime.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return withTime.slice(0, 20);
  } catch (err) {
    console.error("getRecentActivity error:", err);
    return [];
  }
};
