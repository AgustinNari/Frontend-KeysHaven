import { useState, useCallback } from "react";
import { parseApiError } from "../api/apiError";

/**
 * Hook personalizado para manejar errores de API en componentes React
 */
export default function useApiError(initial = null) {
  const [apiError, setApiError] = useState(initial);

  const setFrom = useCallback((err) => {
    const parsedError = parseApiError(err);
    setApiError(parsedError);
    
    // Log para debugging
    console.error("API Error captured:", parsedError);
  }, []);

  const clear = useCallback(() => {
    setApiError(null);
  }, []);

  return {
    apiError,
    setFrom,
    clear,
    hasError: !!apiError
  };
}