import apiClient from "../api/apiClient";


export async function getTopSellers(size = 4) {
  const query = new URLSearchParams({
    page: 0,
    size,
    sort: 'amountSold,desc',
  });

  return apiClient.apiFetch(`/api/v1/sellers/filtered?${query.toString()}`);
}