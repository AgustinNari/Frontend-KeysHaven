import apiClient from "../api/apiClient";

export function register(request) {
  return apiClient.apiFetch("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(request),
  }).then((res) => {

    return res;
  });
}

export function authenticate(authRequest) {
  return apiClient.apiFetch("/api/v1/auth/authenticate", {
    method: "POST",
    body: JSON.stringify(authRequest),
  }).then((res) => res);
}

export function changePassword(body) {
  return apiClient.apiFetch("/api/v1/auth/change-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}