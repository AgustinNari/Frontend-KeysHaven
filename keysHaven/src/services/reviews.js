import apiClient from "../api/apiClient";

export async function getReviewsByProduct(productId, page = 0, size = 10) {
  return apiClient.apiFetch(`/reviews/product/${productId}?page=${page}&size=${size}`);
}

export async function createReview(dto) {
  return apiClient.apiFetch(`/reviews`, { method: "POST", body: JSON.stringify(dto) });
}

export async function updateReview(reviewId, dto) {
  return apiClient.apiFetch(`/reviews/${reviewId}`, { method: "PUT", body: JSON.stringify(dto) });
}

export async function deleteReview(reviewId) {
  return apiClient.apiFetch(`/reviews/${reviewId}`, { method: "DELETE" });
}

export default { getReviewsByProduct, createReview, updateReview, deleteReview };
