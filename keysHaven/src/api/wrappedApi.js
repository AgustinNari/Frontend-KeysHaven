import apiClient from "./apiClient";
import { parseApiError } from "./apiErrors";

export async function apiFetchSafe(path, options = {}) {
  try {
    return await apiClient.apiFetch(path, options);
  } catch (err) {
    // parseApiError devuelve un objeto con info util
    const parsed = parseApiError(err);
    // opcional: rethrow para que los callers lo capturen: throw parsed;
    // o devolver como { error: parsed } según convención de tu proyecto
    throw parsed;
  }
}
