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

const candidatesDefault = path => [path];
const candidatesPreferApiV1 = path => [`/api/v1${path}`];

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

export const getAllProducts = async () => {
  const qs = `?page=0&size=2147483647`;
  const resp = await tryEndpoints(candidatesPreferApiV1(`/products/filtered/all${qs}`), { method: "GET" });
  return extractContentIfPage(resp);
};

export const getActiveProducts = async () => {
  const qs = `?page=0&size=2147483647`;
  const resp = await tryEndpoints(candidatesPreferApiV1(`/products/filtered/active${qs}`), { method: "GET" });
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


export const createCategory = async (categoryData) => {
  return tryEndpoints(candidatesDefault(`/categories`), { method: "POST", body: JSON.stringify(categoryData) });
};

export const updateCategory = async (categoryId, categoryData) => {
  if (typeof categoryData.featured === "boolean") {
    return tryEndpoints(candidatesDefault(`/categories/${categoryId}/featured?featured=${categoryData.featured}`), { method: "PATCH" });
  }
  return tryEndpoints(candidatesDefault(`/categories/${categoryId}`), { method: "PUT", body: JSON.stringify(categoryData) });
};


export const createDiscount = async (discountData) => {
  return tryEndpoints(candidatesDefault(`/discounts`), { method: "POST", body: JSON.stringify(discountData) });
};

export const updateDiscount = async (discountId, discountData) => {
  return tryEndpoints(candidatesDefault(`/discounts/${discountId}`), { method: "PUT", body: JSON.stringify(discountData) });
};



export const getAllReviews = async () => {
  const resp = await tryEndpoints(candidatesDefault(`/reviews?page=0&size=2147483647`), { method: "GET" });
  return extractContentIfPage(resp);
};

export const toggleReviewVisibility = async (reviewId, visible) => {
  return tryEndpoints(candidatesDefault(`/reviews/${reviewId}/visibility?visible=${visible}`), { method: "PATCH" });
};


export const getAdminStatsExtras = async () => {
  const resp = await apiClient.apiFetch('/orders/admin/stats/extras');
  return resp ?? null;
};


export const getAdminStats = async () => {
  try {
    const [users, allProducts, activeProducts, extras] = await Promise.all([
      getUsers().catch(e => { console.warn("getUsers failed", e); return []; }),
      getAllProducts().catch(e => { console.warn("getAllProducts failed", e); return []; }),
      getActiveProducts().catch(e => { console.warn("getActiveProducts failed", e); return []; }),
      getAdminStatsExtras().catch(e => { console.warn("getAdminStatsExtras failed", e); return null; })
    ]);

    const totalUsers = Array.isArray(users) ? users.length : (users?.length ?? 0);
    const totalProducts = Array.isArray(allProducts) ? allProducts.length : (allProducts?.length ?? 0);
    const totalActiveProducts = Array.isArray(activeProducts) ? activeProducts.length : (activeProducts?.length ?? 0);

    const totalOrders = extras?.totalOrders ?? 0;
    const ordersToday = extras?.ordersToday ?? 0;
    const totalReviews = extras?.totalReviews ?? (await getAllReviews()).length;
    const totalRevenue = extras?.totalRevenue ?? 0;

    const activeSellers = Array.isArray(activeProducts) ? new Set((activeProducts || []).map(p => p.sellerId).filter(Boolean)).size : 0;

    return {
      totalUsers,
      totalProducts,
      totalActiveProducts,
      totalOrders,
      ordersToday,
      totalReviews,
      totalRevenue,
      activeSellers
    };
  } catch (err) {
    console.error("getAdminStats error:", err);
    return {
      totalUsers: 0,
      totalProducts: 0,
      totalActiveProducts: 0,
      totalOrders: 0,
      ordersToday: 0,
      totalReviews: 0,
      totalRevenue: 0,
      activeSellers: 0
    };
  }
};

export const getPlatformMetrics = async () => {
  try {
    const [users, reviews] = await Promise.all([getUsers(), getAllReviews()]);
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
      const usersSorted = users.slice().sort((a,b) => {
        const at = new Date(a.createdAt || a.registeredAt || a.lastLogin || 0).getTime();
        const bt = new Date(b.createdAt || b.registeredAt || b.lastLogin || 0).getTime();
        return bt - at;
      }).slice(0, 10);

      usersSorted.forEach(u => {
        const time = u.createdAt ?? u.registeredAt ?? u.lastLogin ?? null;
        activities.push({
          id: `user-${u.id}`,
          type: 'user',
          role: u.role ?? (u.seller ? 'SELLER' : 'BUYER'),
          action: 'Registro de nuevo usuario',
          user: `${(u.displayName ?? '')}`.trim() || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || `User ${u.id}`,
          product: null,
          amount: null,
          time
        });
      });
    }

    if (Array.isArray(reviews)) {
      const reviewsSorted = reviews.slice().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);
      reviewsSorted.forEach(r => {
        activities.push({
          id: `review-${r.id}`,
          type: 'review',
          action: `Reseña (${r.rating ?? '—'}★)`,
          user: r.buyerDisplayName ?? `Comprador ${r.buyerId}`,
          product: r.productTitle ?? `Producto ${r.productId}`,
          amount: null,
          time: r.createdAt ?? null
        });
      });
    }

    if (Array.isArray(products)) {
      const productsSorted = products.slice().sort((a,b) => {
        const at = new Date(a.createdAt ?? a.updatedAt ?? 0).getTime();
        const bt = new Date(b.createdAt ?? b.updatedAt ?? 0).getTime();
        return bt - at;
      }).slice(0, 20);
      productsSorted.forEach(p => {
        activities.push({
          id: `product-${p.id}`,
          type: 'product',
          action: p.active === false ? 'Producto desactivado' : 'Producto publicado',
          user: p.sellerDisplayName ?? `Vendedor ${p.sellerId}`,
          product: p.title ?? `#${p.id}`,
          amount: null,
          time: p.createdAt ?? p.updatedAt ?? null
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

export const getUsersPage = async (page = 1, size = 10) => {
  const resp = await tryEndpoints(candidatesDefault(`/users?page=${Math.max(0, page-1)}&size=${size}`), { method: "GET" });
  return resp;
};

export const getProductsPage = async (page = 1, size = 10) => {
  const resp = await tryEndpoints(candidatesPreferApiV1(`/products/filtered/all?page=${Math.max(0, page-1)}&size=${size}`), { method: "GET" });
  return resp;
};

export const getCategoriesPage = async (page = 1, size = 10) => {
  const resp = await tryEndpoints(candidatesDefault(`/categories?page=${Math.max(0, page-1)}&size=${size}`), { method: "GET" });
  return resp;
};

export const getDiscountsPage = async (page = 1, size = 10) => {
  const resp = await tryEndpoints(candidatesDefault(`/discounts/admin/categories?page=${Math.max(0, page-1)}&size=${size}`), { method: "GET" });
  return resp;
};

export const getReviewsPage = async (page = 1, size = 10) => {
  const resp = await tryEndpoints(candidatesDefault(`/reviews?page=${Math.max(0, page-1)}&size=${size}`), { method: "GET" });
  return resp;
};


export default {
  getAllProducts,
  getActiveProducts,
  updateProduct,
  createCategory,
  updateCategory,
  createDiscount,
  updateDiscount,
  getUsers,
  getUsersPage,
  updateUser,
  getRecentActivity,
  getAdminStats,
  getPlatformMetrics,
  getProductsPage,
  getCategoriesPage,
  getDiscountsPage,
  getReviewsPage,
  toggleReviewVisibility
};
