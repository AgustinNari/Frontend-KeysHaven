import apiClient from "../api/apiClient";

function buildQueryString(params = {}) {
  const keys = Object.keys(params || {});
  if (keys.length === 0) return "";
  const usp = new URLSearchParams();
  for (const k of keys) {
    const val = params[k];
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      val.forEach(v => usp.append(k, v));
    } else {
      usp.append(k, String(val));
    }
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export const getProducts = (filters = {}) => {
  const qs = buildQueryString(filters);
  return apiClient.apiFetch(`/products${qs}`, { method: "GET" });
};

export const getProductById = (productId) =>
  apiClient.apiFetch(`/products/${productId}`, { method: "GET" });

export const getCategories = () =>
  apiClient.apiFetch('/categories', { method: "GET" });
