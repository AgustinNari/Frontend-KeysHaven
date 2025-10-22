let lastError = null;

export function setLastApiError(error) {
  lastError = error;
}

export function getLastApiError() {
  return lastError;
}