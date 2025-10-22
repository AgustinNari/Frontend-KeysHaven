import apiClient from "../api/apiClient";


async function getAllCategories() {
  const resp = await apiClient.apiFetch(`/categories?page=0&size=1000`);
  const content = resp?.content ?? resp?.items ?? [];
  return content;
}

export default { getAllCategories };
