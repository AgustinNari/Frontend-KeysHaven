import apiClient from "../api/apiClient";


export async function getActiveCouponsByBuyer(page = 0, size = 100) {
  return apiClient.apiFetch(`/discounts/buyer/active-coupons?page=${page}&size=${size}`, { method: "GET" });
}

export async function validateCouponForOrderItem(code, item) {
  const body = {
    code,
    item
  };
  return apiClient.apiFetch(`/discounts/validate`, { method: "POST", body: JSON.stringify(body) });
}


export default {
  getActiveCouponsByBuyer,
  validateCouponForOrderItem
};
