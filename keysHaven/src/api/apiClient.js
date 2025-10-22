import { setLastApiError } from '../services/errorService';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function apiFetch(path, options = {}, navigate) {
  const url = `${API_BASE}${path}`;
  const token = localStorage.getItem("jwtToken");

  const headers = Object.assign({}, options.headers || {});
  if (!(options.body instanceof FormData) && headers["Content-Type"] === undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const resp = await fetch(url, { ...options, headers });
  const contentType = resp.headers.get("content-type") || "";

  if (resp.status === 401) {
    const text = await resp.text();
    const err = new Error("Unauthorized");
    err.status = 401;
    err.body = text;

    // Save the error and optionally redirect
    setLastApiError({ status: 401, message: "Unauthorized", details: [text] });
    if (navigate) navigate("/401");

    throw err;
  }

  if (!resp.ok) {
    if (contentType.includes("application/json")) {
      const errBody = await resp.json();
      const err = new Error(errBody.message || resp.statusText);
      err.status = resp.status;
      err.body = errBody;

      // Save error globally
      setLastApiError(errBody);

      // Optional redirect based on status
      if (navigate) {
        const redirectStatus = [400, 401, 403, 404, 409, 500].includes(err.status)
          ? err.status
          : "error";
        navigate(`/${redirectStatus}`);
      }

      throw err;
    } else {
      const txt = await resp.text();
      const err = new Error(txt || resp.statusText);
      err.status = resp.status;
      err.body = txt;

      setLastApiError({
        status: err.status,
        message: txt || "Unexpected error",
        details: [],
      });

      if (navigate) navigate(`/${err.status}`);

      throw err;
    }
  }

  if (resp.status === 204 || (resp.status === 201 && contentType === "")) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return resp.json();
  }

  return resp.text();
}

export default { apiFetch, API_BASE };