import apiClient from "../api/apiClient";
import { normalizeProductsStock } from "../utils/stock";

function buildQueryString(params = {}) {
  const usp = new URLSearchParams();
  for (const k of Object.keys(params || {})) {
    const val = params[k];
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) val.forEach(v => usp.append(k, String(v)));
    else usp.append(k, String(val));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}
function dataUrlToBlob(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  if (dataUrl.startsWith("data:")) {
    const parts = dataUrl.split(",");
    const meta = parts[0];
    const base64 = parts[1];
    const mime = (meta.split(":")[1] || "application/octet-stream").split(";")[0];
    const binary = atob(base64);
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
    return new Blob([u8], { type: mime });
  }
  return null;
}


function ensurePrimaryImage(product) {
  if (!product || typeof product !== "object") return product;

  const copy = { ...product };

  let primary = null;

  if (copy.primaryImageDataUrl) {
    copy.primaryImageUrl = copy.primaryImageDataUrl;
    return copy;
  }

  if (copy.primaryImageUrl) {
    return copy;
  }

  if (Array.isArray(copy.imageUrls) && copy.imageUrls.length > 0) {
    copy.primaryImageUrl = copy.imageUrls[0];
    return copy;
  }

  const imgs = copy.images || [];
  if (Array.isArray(imgs) && imgs.length > 0) {
    const found = imgs.find(i => i.isPrimary) || imgs[0];
    const candidate = found?.dataUrl ?? found?.file ?? found?.url ?? null;
    if (candidate) {
      copy.primaryImageUrl = candidate;
      if (typeof candidate === "string" && candidate.startsWith("data:")) {
        copy.primaryImageDataUrl = candidate;
      }
      return copy;
    }
  }

  if (copy.primaryImageContentType && copy.primaryImageDataUrl) {
    copy.primaryImageUrl = copy.primaryImageDataUrl;
    return copy;
  }

  return copy;
}

export const getSellerProductsPaginated = async (sellerId, page = 0, size = 10) => {
  try {
    const qs = buildQueryString({ page, size, sellerId });
    const res = await apiClient.apiFetch(`/api/v1/products/filtered/all${qs}`, { method: "GET" });
    if (!res) return { items: [], total: 0 };

    let items = Array.isArray(res) ? res : (res.content ?? res.items ?? []);
    const total = Array.isArray(res) ? items.length : (res.totalElements ?? res.total ?? items.length);

    let normalized = normalizeProductsStock(items);
    if (Array.isArray(normalized)) {
      normalized = normalized.map(ensurePrimaryImage);
    }

    return { items: normalized, total };
  } catch (err) {
    console.error("getSellerProductsPaginated error:", err);
    return { items: [], total: 0 };
  }
};


export const getSellerProducts = async (sellerId) => {
  try {
    const qs = buildQueryString({ page: 0, size: 2147483647, sellerId });
    const res = await apiClient.apiFetch(`/api/v1/products/filtered/all${qs}`, { method: "GET" });
    if (!res) return [];

    let items = [];
    if (Array.isArray(res)) items = res;
    else items = res.content ?? res.items ?? [];

    let normalized = normalizeProductsStock(items);
    if (Array.isArray(normalized)) {
      normalized = normalized.map(ensurePrimaryImage);
    }

    return normalized;
  } catch (err) {
    console.error("getSellerProducts error:", err);
    return [];
  }
};


export const getSellerActiveProducts = async (sellerId) => {
  try {
    const sId = sellerId ? (Number.isNaN(Number(sellerId)) ? sellerId : Number(sellerId)) : undefined;
    const qs = buildQueryString({ page: 0, size: 2147483647, sellerId: sId });
    const res = await apiClient.apiFetch(`/api/v1/products/filtered/all${qs}`, { method: "GET" });
    if (!res) return [];

    let items = [];
    if (Array.isArray(res)) items = res;
    else items = res.content ?? res.items ?? [];

    let normalized = normalizeProductsStock(items);
    if (Array.isArray(normalized)) {
      normalized = normalized.map(ensurePrimaryImage);
    }

    if ((!normalized || normalized.length === 0) && sId) {
      try {
        const fallback = await getSellerProducts(sId);
        const onlyActive = (Array.isArray(fallback) ? fallback : []).filter(p => p.active !== false);
        if (onlyActive.length > 0) return onlyActive;
        return fallback;
      } catch (fbErr) {
        console.warn("Fallback getSellerProducts failed:", fbErr);
      }
    }

    return normalized;
  } catch (err) {
    console.error("getSellerActiveProducts error:", err);
    return [];
  }
};

function normalizeDiscountValueToFraction(raw) {
  if (raw == null) return null;
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  if (n > 1) return n / 100;
  return n;
}

export const getSellerActiveProductsForDetail = async (sellerId) => {
  try {
    const sId = sellerId ? (Number.isNaN(Number(sellerId)) ? sellerId : Number(sellerId)) : undefined;
    const qs = buildQueryString({ page: 0, size: 2147483647, sellerId: sId });
    const res = await apiClient.apiFetch(`/api/v1/products/filtered/active${qs}`, { method: "GET" });
    if (!res) return [];

    let items = [];
    if (Array.isArray(res)) items = res;
    else items = res.content ?? res.items ?? [];

    let normalized = normalizeProductsStock(items);
    if (Array.isArray(normalized)) {
      normalized = normalized.map(ensurePrimaryImage);
    }

    normalized = normalized.map(p => {
      let bestDiscountFrac = null;
      let discountedPrice = null;

      if (p.bestDiscount != null) {
        const rawVal = p.bestDiscount.value;
        bestDiscountFrac = normalizeDiscountValueToFraction(rawVal);

        if (p.bestDiscount.type === "PERCENT" || p.bestDiscount.type === "PERCENT") {
          const basePrice = Number(p.price ?? 0);
          if (bestDiscountFrac != null && !Number.isNaN(basePrice)) {
            discountedPrice = Math.max(0, Math.round((basePrice * (1 - bestDiscountFrac)) * 100) / 100);
          }
        } else if (p.bestDiscount.type === "FIXED") {
          const fixedVal = Number(rawVal ?? 0);
          const basePrice = Number(p.price ?? 0);
          if (!Number.isNaN(basePrice)) {
            discountedPrice = Math.max(0, Math.round((basePrice - fixedVal) * 100) / 100);
          }
        }
      }

      return {
        ...p,
        discountedPrice,
      };
    });

    if ((!normalized || normalized.length === 0) && sId) {
      try {
        const fallback = await getSellerProducts(sId);
        const onlyActive = (Array.isArray(fallback) ? fallback : []).filter(p => p.active !== false);
        if (onlyActive.length > 0) return onlyActive;
        return fallback;
      } catch (fbErr) {
        console.warn("Fallback getSellerProducts failed:", fbErr);
      }
    }

    return normalized;
  } catch (err) {
    console.error("getSellerActiveProducts error:", err);
    return [];
  }
};


export const getProductDetail = async (productId) => {
  try {
    if (!productId) return null;
    return await apiClient.apiFetch(`/products/${productId}/detail`, { method: "GET" });
  } catch (err) {
    console.error("getProductDetail error:", err);
    return null;
  }
};

export const createProduct = async (productData) => {
  try {
    return await apiClient.apiFetch(`/products`, { method: "POST", body: JSON.stringify(productData) });
  } catch (err) {
    console.error("createProduct error:", err);
    throw err;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    return await apiClient.apiFetch(`/products/${productId}`, { method: "PUT", body: JSON.stringify(productData) });
  } catch (err) {
    console.error("updateProduct error:", err);
    throw err;
  }
};

export const addProductImage = async (productId, { name, dataUrl, contentType, isPrimary = false }) => {
  const form = new FormData();
  form.append("productId", String(productId));
  form.append("name", name || "");
  form.append("isPrimary", String(Boolean(isPrimary)));

  try {

    if (dataUrl && typeof dataUrl === "string") {
      if (dataUrl.startsWith("data:")) {
        const blob = dataUrlToBlob(dataUrl);
        if (!blob) throw new Error("No se pudo convertir data URL a archivo");
        form.append("file", blob, name || "image.png");
      } else if (dataUrl.startsWith("http")) {

        try {
          const resp = await fetch(dataUrl);
          if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
          const blob = await resp.blob();
          const filename = (name || "image").replace(/\s+/g, "_") + ".png";
          form.append("file", blob, filename);
        } catch (err) {
          console.warn("No se pudo obtener la URL remota para subirla al backend (CORS?):", err);
          throw new Error("No se pudo obtener la imagen remota (posible problema de CORS). Sube un archivo en su lugar.");
        }
      } else {
        throw new Error("Formato de imagen inválido. Usa un archivo o un dataURL o una URL pública (con CORS).");
      }
    } else {
      throw new Error("Imagen inválida: no hay dataUrl ni archivo");
    }

    return await apiClient.apiFetch(`/product_images`, { method: "POST", body: form });
  } catch (err) {
    console.error("addProductImage error:", err);
    throw err;
  }
};

export const updateProductImage = async (imageId, { name, isPrimary, dataUrl, contentType }) => {
  const form = new FormData();
  if (typeof name !== "undefined") form.append("name", name);
  if (typeof isPrimary !== "undefined") form.append("isPrimary", String(Boolean(isPrimary)));
  try {
    if (dataUrl && dataUrl.startsWith("data:")) {
      const blob = dataUrlToBlob(dataUrl);
      if (blob) form.append("file", blob, name || "image.png");
    } else if (dataUrl && dataUrl.startsWith("http")) {

      const resp = await fetch(dataUrl);
      if (resp.ok) {
        const blob = await resp.blob();
        const filename = (name || "image").replace(/\s+/g, "_") + ".png";
        form.append("file", blob, filename);
      }
    }
    return await apiClient.apiFetch(`/product_images/${imageId}`, { method: "PUT", body: form });
  } catch (err) {
    console.error("updateProductImage error:", err);
    throw err;
  }
};

export const deleteProductImage = async (imageId) => {
  try {
    return await apiClient.apiFetch(`/product_images/${imageId}`, { method: "DELETE" });
  } catch (err) {
    console.error("deleteProductImage error:", err);
    throw err;
  }
};

export const setPrimaryImage = async (imageId) => {
  try {
    return await apiClient.apiFetch(`/product_images/${imageId}/primary`, { method: "PATCH" });
  } catch (err) {
    console.error("setPrimaryImage error:", err);
    throw err;
  }
};



export const getProductKeys = async (productId, page = 0, size = 20) => {
  try {
    const qs = buildQueryString({ page, size });
    const resp = await apiClient.apiFetch(`/digital_keys/product/${productId}${qs}`, { method: "GET" });
    if (!resp) return { items: [], total: 0 };
    if (Array.isArray(resp)) return { items: resp, total: resp.length };
    const items = resp.content ?? resp.items ?? resp.data ?? [];
    const total = resp.totalElements ?? resp.total ?? (Array.isArray(items) ? items.length : 0);
    return { items, total };
  } catch (err) {
    console.error("getProductKeys error:", err);
    return { items: [], total: 0 };
  }
};

export const addBulkDigitalKeys = async (payload) => {
  try {
    return await apiClient.apiFetch(`/digital_keys`, { method: "POST", body: JSON.stringify(payload) });
  } catch (err) {
    console.error("addBulkDigitalKeys error:", err);
    throw err;
  }
};



export const getSellerDiscounts = async (page = 0, size = 10) => {
  try {
    const qs = buildQueryString({ page, size });
    const res = await apiClient.apiFetch(`/discounts/seller/me${qs}`, { method: "GET" });
    if (!res) return { items: [], total: 0 };
    if (Array.isArray(res)) return { items: res, total: res.length };
    const items = res.content ?? res.items ?? [];
    const total = res.totalElements ?? res.total ?? items.length;
    return { items, total };
  } catch (err) {
    console.error("getSellerDiscounts error:", err);
    return { items: [], total: 0 };
  }
};

export const createDiscount = async (discountData) => {
  const payload = { ...discountData, targetBuyerId: null };
  try {
    return await apiClient.apiFetch(`/discounts`, { method: "POST", body: JSON.stringify(payload) });
  } catch (err) {
    console.error("createDiscount error:", err);
    throw err;
  }
};

export const updateDiscount = async (discountId, discountData) => {
  const payload = { ...discountData };
  if (!("targetBuyerId" in payload)) payload.targetBuyerId = null;
  try {
    return await apiClient.apiFetch(`/discounts/${discountId}`, { method: "PUT", body: JSON.stringify(payload) });
  } catch (err) {
    console.error("updateDiscount error:", err);
    throw err;
  }
};



export const getSellerOrders = async ({ sellerId, page = 0, size = 10, status } = {}) => {
  if (!sellerId) return { items: [], total: 0 };
  try {
    const qs = buildQueryString({ page, size, status });
    const resp = await apiClient.apiFetch(`/orders/seller/${sellerId}${qs}`, { method: "GET" });
    if (!resp) return { items: [], total: 0 };
    if (Array.isArray(resp)) return { items: resp, total: resp.length };
    return { items: resp.content ?? resp.items ?? [], total: resp.totalElements ?? resp.total ?? 0 };
  } catch (err) {
    console.error("getSellerOrders error:", err);
    return { items: [], total: 0 };
  }
};


export const getSellerStats = async (sellerId) => {
  try {
    if (!sellerId) return null;

    const sellerDetail = await apiClient.apiFetch(`/users/seller/${sellerId}/detail`, { method: "GET" });
    if (!sellerDetail) return null;

    const products = await getSellerProducts(sellerId);
    const ordersResp = await getSellerOrders({ sellerId, page: 0, size: 1000 });
    const orders = ordersResp.items || [];
    const totalSales = ordersResp.total ?? (Array.isArray(orders) ? orders.length : 0);

    let totalRevenue = 0;
    if (Array.isArray(orders)) {
      orders.forEach(o => {
        const items = Array.isArray(o.items) ? o.items : [];
        const itemsSum = items.reduce((acc, it) => {
          const val = parseFloat(it?.lineTotal ?? it?.lineSubtotal ?? it?.unitPrice * (it?.quantity ?? 1)) || 0;
          return acc + val;
        }, 0);
        totalRevenue += itemsSum;
      });
    }

    const activeProducts = (products || []).filter(p => p.active).length;
    const totalProducts = (products || []).length;

    return {
      id: sellerDetail.id,
      displayName: sellerDetail.displayName,
      sellerDescription: sellerDetail.sellerDescription,
      avatarDataUrl: sellerDetail.avatarDataUrl,
      avatarContentType: sellerDetail.avatarContentType,
      firstName: sellerDetail.firstName,
      lastName: sellerDetail.lastName,
      email: sellerDetail.email,
      phone: sellerDetail.phone,
      country: sellerDetail.country,

      avgRating: (sellerDetail.avgRating ?? 0),
      ratingCount: sellerDetail.ratingCount ?? 0,
      soldKeys: sellerDetail.soldKeys ?? 0,
      amountSold: sellerDetail.amountSold ?? 0,
      totalSales,
      totalRevenue,
      activeProducts,
      totalProducts
    };
  } catch (err) {
    console.warn("getSellerStats fallback: ", err);

    try {
      const products = await getSellerProducts(sellerId);
      const ordersResp = await getSellerOrders({ sellerId, page: 0, size: 1000 });
      const orders = ordersResp.items || [];
      const totalSales = ordersResp.total ?? (Array.isArray(orders) ? orders.length : 0);

      let totalRevenue = 0;
      orders.forEach(o => {
        const items = Array.isArray(o.items) ? o.items : [];
        totalRevenue += items.reduce((acc, it) => {
          const val = parseFloat(it?.lineTotal ?? it?.lineSubtotal ?? it?.unitPrice * (it?.quantity ?? 1)) || 0;
          return acc + val;
        }, 0);
      });
      const activeProducts = (products || []).filter(p => p.active).length;
      const totalProducts = (products || []).length;

      return {
        avgRating: 0,
        ratingCount: 0,
        soldKeys: 0,
        amountSold: 0,
        totalSales,
        totalRevenue,
        activeProducts,
        totalProducts
      };
    } catch (err2) {
      console.error("Error computing fallback stats:", err2);
      return {
        avgRating: 0,
        ratingCount: 0,
        soldKeys: 0,
        amountSold: 0,
        totalSales: 0,
        totalRevenue: 0,
        activeProducts: 0,
        totalProducts: 0
      };
    }
  }
};


export const getCategories = async () => {
  try {
    const qs = buildQueryString({ page: 0, size: 2147483647 });
    const res = await apiClient.apiFetch(`/categories${qs}`, { method: "GET" });
    if (!res) return [];

    if (Array.isArray(res)) return res;
    return res.content ?? [];
  } catch (err) {
    console.error("getCategories error:", err);
    return [];
  }
};


export const updateUser = async (userId, payload) => {
  try {
    return await apiClient.apiFetch(`/users/${userId}`, { method: "PUT", body: JSON.stringify(payload) });
  } catch (err) {
    console.error("updateUser error:", err);
    throw err;
  }
};

export const getUserById = async (userId) => {
  try {
    return await apiClient.apiFetch(`/users/${userId}`, { method: "GET" });
  } catch (err) {
    console.error("getUserById error:", err);
    throw err;
  }
};


export default {
  getSellerActiveProductsForDetail,
  deleteProductImage,
  setPrimaryImage,
  updateDiscount,
  updateProduct,
  addProductImage,
  updateProductImage,
  getSellerDiscounts,
  addBulkDigitalKeys,
  createDiscount,
  createProduct,
  getSellerActiveProducts,
  getProductKeys,
  getSellerProductsPaginated,
  getSellerProducts,
  getSellerOrders,
  getSellerStats,
  getCategories,
  updateUser,
  getUserById
};

