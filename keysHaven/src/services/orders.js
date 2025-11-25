import apiClient from "../api/apiClient";


export function getMyOrders(page = 0, size = 20) {
  return apiClient.apiFetch(`/orders/my?page=${page}&size=${size}`, { method: "GET" });
}


export function getKeysByOrderItemId(orderItemId) {
  return apiClient.apiFetch(`/orders/items/${orderItemId}/keys`, { method: "GET" });
}


export function createOrder(dto) {
  return apiClient.apiFetch(`/orders`, { method: "POST", body: JSON.stringify(dto) });
}

export default {
  getMyOrders,
  getKeysByOrderItemId,
  createOrder
};
