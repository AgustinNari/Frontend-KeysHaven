const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function apiFetch(path, options = {}) {
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


  if (resp.status === 401) {
    const text = await resp.text();
    const err = new Error("Unauthorized");
    err.status = 401;
    err.body = text;
    throw err;
  }

  const contentType = resp.headers.get("content-type") || "";

  if (!resp.ok) {
    if (contentType.includes("application/json")) {
      const errBody = await resp.json();
      const err = new Error(errBody.message || resp.statusText);
      err.status = resp.status;
      err.body = errBody;
      throw err;
    } else {
      const txt = await resp.text();
      const err = new Error(txt || resp.statusText);
      err.status = resp.status;
      err.body = txt;
      throw err;
    }
  }


  if (resp.status === 204 || resp.status === 201 && contentType === "") {
    return null;
  }

  if (contentType.includes("application/json")) {
    return resp.json();
  }


  return resp.text();
}

export default { apiFetch, API_BASE };
