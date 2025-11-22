// services/reviews.js
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

export function getReviewByOrderItem(orderItemId) {
  return apiClient.apiFetch(`/reviews/order-item/${orderItemId}`, { method: "GET" });
}

// NUEVO: Servicio para obtener las últimas reviews
export async function getLatestReviews(count = 5) {
  return apiClient.apiFetch(`/reviews/latest?count=${count}`);
}

export default { 
  getReviewsByProduct, 
  createReview, 
  updateReview, 
  deleteReview, 
  getReviewByOrderItem,
  getLatestReviews // Añadir al export
};