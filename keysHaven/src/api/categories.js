import apiClient from "./apiClient";

export async function getFeaturedCategories(page = 0, size = 5) {
  return apiClient.apiFetch(`/categories/featured?page=${page}&size=${size}`);
}