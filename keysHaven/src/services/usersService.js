import apiClient from "../api/apiClient";

export const updateUser = async (userId, payload) => {
  try {
    return await apiClient.apiFetch(`/users/${userId}`, { method: "PUT", body: JSON.stringify(payload) });
  } catch (err) {
    console.error("updateUser error:", err);
    throw err;
  }
};

export const getUserById = async (userId) => {
  try {
    return await apiClient.apiFetch(`/users/${userId}`, { method: "GET" });
  } catch (err) {
    console.error("getUserById error:", err);
    throw err;
  }
};
