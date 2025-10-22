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



export const getSellerProducts = async (sellerId) => {
  try {
    const qs = buildQueryString({ page: 0, size: 2147483647, sellerId });
    const res = await apiClient.apiFetch(`/api/v1/products/filtered/all${qs}`, { method: "GET" });
    if (!res) return [];

    let items = [];
    if (Array.isArray(res)) items = res;
    else items = res.content ?? res.items ?? [];

    return normalizeProductsStock(items);
  } catch (err) {
    console.error("getSellerProducts error:", err);
    return [];
  }
};


export const getSellerActiveProducts = async (sellerId) => {
  try {
    const qs = buildQueryString({ page: 0, size: 2147483647, sellerId });
    const res = await apiClient.apiFetch(`/api/v1/products/filtered/active${qs}`, { method: "GET" });
    if (!res) return [];

    let items = [];
    if (Array.isArray(res)) items = res;
    else items = res.content ?? res.items ?? [];

    return normalizeProductsStock(items);
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

export const toggleProductActivity = async (productId, isActive) => {
  try {
    return await apiClient.apiFetch(`/products/${productId}/active?active=${isActive}`, { method: "PATCH" });
  } catch (err) {
    console.error("toggleProductActivity error:", err);
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



export const getProductKeys = async (productId) => {
  try {
    return await apiClient.apiFetch(`/digital_keys/product/${productId}`, { method: "GET" });
  } catch (err) {
    console.error("getProductKeys error:", err);
    return [];
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



export const getSellerDiscounts = async () => {
  try {
    const qs = buildQueryString({ page: 0, size: 2147483647 });
    const res = await apiClient.apiFetch(`/discounts/seller/me${qs}`, { method: "GET" });
    if (!res) return [];
    return res.content ?? res;
  } catch (err) {
    console.error("getSellerDiscounts error:", err);
    return [];
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



export const getSellerOrders = async ({ sellerId, limit = 10, status } = {}) => {
  if (!sellerId) return { items: [], total: 0 };
  try {
    const qs = buildQueryString({ page: 0, size: limit, status });
    const resp = await apiClient.apiFetch(`/orders/seller/${sellerId}${qs}`, { method: "GET" });
    if (!resp) return { items: [], total: 0 };
    if (Array.isArray(resp)) return { items: resp, total: resp.length };
    return { items: resp.content ?? resp.items ?? [], total: resp.totalElements ?? resp.total ?? 0 };
  } catch (err) {
    console.error("getSellerOrders error:", err);
    return { items: [], total: 0 };
  }
};


// en sellerService (reemplaza getSellerStats existente)
export const getSellerStats = async (sellerId) => {
  try {
    if (!sellerId) return null;

    // petición que ya tenías: trae el detalle del seller (puede devolver null si 204)
    const sellerDetail = await apiClient.apiFetch(`/users/seller/${sellerId}/detail`, { method: "GET" });
    if (!sellerDetail) return null;

    // productos y órdenes para calcular métricas
    const products = await getSellerProducts(sellerId);
    const ordersResp = await getSellerOrders({ sellerId, limit: 1000 });
    const orders = ordersResp.items || [];

    const totalSales = orders.length;
    let totalRevenue = 0;
    orders.forEach(o => {
      const amount = o.totalAmount ?? o.amount ?? 0;
      totalRevenue += Number(amount || 0);
    });

    const activeProducts = (products || []).filter(p => p.active).length;
    const totalProducts = (products || []).length;

    // Devuelve los campos del sellerDetail + estadísticas calculadas
    return {
      // perfil (viene del backend)
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

      // estadísticas (desde sellerDetail si vienen, o calculadas)
      avgRating: sellerDetail.avgRating ?? 0,
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
      // fallback: intentar calcular stats sin sellerDetail
      const products = await getSellerProducts(sellerId);
      const ordersResp = await getSellerOrders({ sellerId, limit: 1000 });
      const orders = ordersResp.items || [];
      const totalSales = orders.length;
      let totalRevenue = 0;
      orders.forEach(o => {
        const amount = o.totalAmount ?? o.amount ?? 0;
        totalRevenue += Number(amount || 0);
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
