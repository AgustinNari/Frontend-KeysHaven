import apiClient from "../api/apiClient";

import { parseApiError } from "./apiError";

export async function apiFetchSafe(path, options = {}) {
  try {
    return await apiClient.apiFetch(path, options);
  } catch (err) {
    const parsed = parseApiError(err);
    throw parsed;
  }
}
