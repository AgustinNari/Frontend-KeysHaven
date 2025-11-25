import apiClient from "../api/apiClient";




export async function getFeaturedCategories(page = 0, size = 5) {
  return apiClient.apiFetch(`/categories/featured?page=${page}&size=${size}`);
}

async function getAllCategories() {
  const resp = await apiClient.apiFetch(`/categories?page=0&size=1000`);
  const content = resp?.content ?? resp?.items ?? [];
  return content;
}

export default {getFeaturedCategories , getAllCategories};
