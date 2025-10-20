import apiClient from "./apiClient";

export function getReviewByOrderItem(orderItemId) {
  return apiClient.apiFetch(`/reviews/order-item/${orderItemId}`, { method: "GET" });
}

export function createReview(dto) {
  return apiClient.apiFetch(`/reviews`, { method: "POST", body: JSON.stringify(dto) });
}

export function updateReview(reviewId, dto) {
  return apiClient.apiFetch(`/reviews/${reviewId}`, { method: "PUT", body: JSON.stringify(dto) });
}

export function deleteReview(reviewId) {
  return apiClient.apiFetch(`/reviews/${reviewId}`, { method: "DELETE" });
}
