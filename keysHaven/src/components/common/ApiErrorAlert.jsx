import { localizeErrorMessage } from '../../utils/displayText';
import React from "react";

/**
 * Componente para mostrar errores de API de manera amigable al usuario
 */
export default function ApiErrorAlert({ error, onRetry, onClose, className = "" }) {
  if (!error) return null;

  const { status, userMessage, message, details = [], isNetwork } = error;

  // Determinar la clase de alerta basada en el tipo de error
  const getAlertVariant = () => {
    if (status >= 500) return "alert-danger";
    if (status >= 400) return "alert-warning";
    return "alert-secondary";
  };

  return (
    <div 
      className={`alert ${getAlertVariant()} d-flex justify-content-between align-items-start ${className}`} 
      role="alert"
      style={{ maxWidth: "100%" }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Mensaje principal para el usuario */}
        <div className="fw-bold mb-1">{localizeErrorMessage(userMessage)}</div>

        {/* Mensaje técnico (solo si es diferente y útil para debugging) */}
        {message && message !== userMessage && (
          <div className="mb-2">
            <small className="text-muted" style={{ wordBreak: "break-word" }}>
              {localizeErrorMessage(message)}
            </small>
          </div>
        )}

        {/* Indicador de problema de red */}
        {isNetwork && (
          <div className="mb-2">
            <small className="text-muted">
              💡 Comprueba tu conexión a internet e inténtalo de nuevo.
            </small>
          </div>
        )}

        {/* Detalles específicos del error (validaciones, etc.) */}
        {details && details.length > 0 && (
          <div className="mt-2">
            <small className="fw-semibold d-block mb-1">Detalles:</small>
            <ul className="mb-0 ps-3" style={{ fontSize: "0.875rem" }}>
              {details.map((detail, index) => (
                <li key={index} style={{ wordBreak: "break-word" }}>
                  <small>{localizeErrorMessage(String(detail))}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="d-flex flex-column gap-1 ms-2" style={{ flexShrink: 0 }}>
        {onRetry && (
          <button 
            type="button" 
            className="btn btn-outline-primary btn-sm"
            onClick={onRetry}
            title="Reintentar la operación"
          >
            🔄 Reintentar
          </button>
        )}
        {onClose && (
          <button 
            type="button" 
            className="btn btn-outline-secondary btn-sm"
            onClick={onClose}
            title="Cerrar este mensaje"
          >
            ✕ Cerrar
          </button>
        )}
      </div>
    </div>
  );
}