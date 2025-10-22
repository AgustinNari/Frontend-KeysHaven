import apiClient from "./apiClient";

export async function getFeaturedCategories(page = 0, size = 5) {
  return apiClient.apiFetch(`/api/categories/featured?page=${page}&size=${size}`);
}