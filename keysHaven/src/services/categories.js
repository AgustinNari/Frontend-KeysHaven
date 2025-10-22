import apiClient from "../api/apiClient";



export async function getAllCategories(page = 0, size = 1000) {
  const qs = new URLSearchParams();
  qs.append("page", String(page));
  qs.append("size", String(size));
  return apiClient.apiFetch(`/categories?${qs.toString()}`);
}

export default { getAllCategories };
