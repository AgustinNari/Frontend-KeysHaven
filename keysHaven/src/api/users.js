import apiClient from "./apiClient";

export function getMyProfile() {
  return apiClient.apiFetch("/users/me/profile", {
    method: "GET",
  });
}


export function updateUser(userId, dto) {
  return apiClient.apiFetch(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function uploadAvatar(userId, file) {
  const fd = new FormData();
  fd.append("file", file);
  return apiClient.apiFetch(`/users/${userId}/avatar`, {
    method: "POST",
    body: fd,
  });
}

export function replaceAvatar(userId, file) {
  const fd = new FormData();
  fd.append("file", file);
  return apiClient.apiFetch(`/users/${userId}/avatar`, {
    method: "PUT",
    body: fd,
  });
}

export function deleteAvatar(userId) {
  return apiClient.apiFetch(`/users/${userId}/avatar`, {
    method: "DELETE",
  });
}