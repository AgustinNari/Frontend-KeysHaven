import apiClient from "../api/apiClient";


export async function getSellerDetail(sellerId) {
  return apiClient.apiFetch(`/users/seller/${sellerId}/detail`);
}

export default { getSellerDetail };
