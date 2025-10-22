/**
 * Utilidades para normalizar y manejar errores de API
 */

function safeParseJSON(input) {
  try {
    if (!input) return null;
    if (typeof input === "object") return input;
    return JSON.parse(input);
  } catch {
    return null;
  }
}

/**
 * Deriva mensajes amigables para el usuario basados en el código de estado HTTP
 */
export function deriveUserMessage(status = 0, serverMessage = "") {
  switch (status) {
    case 0:
      return "No se pudo conectar con el servidor. Revisa tu conexión.";
    case 400:
      return serverMessage || "Solicitud inválida.";
    case 401:
      return "No estás autenticado. Inicia sesión nuevamente.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "Recurso no encontrado.";
    case 409:
      return serverMessage || "Conflicto al procesar la solicitud.";
    case 422:
      return "Datos inválidos. Revisa los campos señalados.";
    case 500:
    default:
      return "Ocurrió un error en el servidor. Intenta nuevamente más tarde.";
  }
}

/**
 * Normaliza distintos formatos de error que puede lanzar apiClient.apiFetch
 */
export function parseApiError(err = {}) {
  // Si es una string simple
  if (typeof err === "string") {
    return {
      status: 0,
      message: err,
      userMessage: err,
      details: [],
      raw: err,
      isNetwork: false
    };
  }

  const status = err.status ?? (err.response && err.response.status) ?? 0;
  const body = err.body ?? (err.response && err.response.body) ?? null;

  const parsedBody = safeParseJSON(body) ?? body;

  // Backend ApiError DTO: { timestamp, status, error, message, details, path }
  const messageFromBody = (parsedBody && (parsedBody.message || parsedBody.error)) || null;
  const details = (parsedBody && (parsedBody.details || parsedBody.errors || parsedBody.fieldErrors)) || [];

  const isNetwork = !!(
    err instanceof TypeError ||
    err.message?.toLowerCase?.().includes("network") ||
    err.message?.toLowerCase?.().includes("failed to fetch")
  );

  const userMessage = deriveUserMessage(status, messageFromBody || err.message);

  return {
    status,
    message: messageFromBody || err.message || "Error desconocido",
    userMessage,
    details: Array.isArray(details) ? details : [String(details)].filter(Boolean),
    path: parsedBody?.path ?? null,
    timestamp: parsedBody?.timestamp ?? null,
    raw: err,
    isNetwork
  };
}

/**
 * Wrapper seguro para apiClient que parsea errores automáticamente
 */
export async function apiFetchSafe(apiClient, path, options = {}) {
  try {
    return await apiClient.apiFetch(path, options);
  } catch (err) {
    throw parseApiError(err);
  }
}

export default {
  parseApiError,
  deriveUserMessage,
  apiFetchSafe
};