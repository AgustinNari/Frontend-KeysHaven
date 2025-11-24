import apiClient from "../api/apiClient";



export async function getAllCategories(page = 0, size = 1000) {
  const qs = new URLSearchParams();
  qs.append("page", String(page));
  qs.append("size", String(size));
  return apiClient.apiFetch(`/categories?${qs.toString()}`);
}

export async function getFeaturedCategories(page = 0, size = 5) {
  return apiClient.apiFetch(`/categories/featured?page=${page}&size=${size}`);
}

async function getAllCategoriesAlt() {
  const resp = await apiClient.apiFetch(`/categories?page=0&size=1000`);
  const content = resp?.content ?? resp?.items ?? [];
  return content;
}

export default { getAllCategories, getFeaturedCategories , getAllCategoriesAlt};
