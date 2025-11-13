// Use a deploy-time env var for the API root. If not set, fall back to
// relative paths so the app can call the same origin (useful when the
// backend serves the frontend or for local dev with a proxy).
const BASE_URL = process.env.REACT_APP_API_URL || "";

let token = localStorage.getItem("token");

export function setToken(newToken) {
  token = newToken;
  if (newToken) {
    localStorage.setItem("token", newToken);
  } else {
    localStorage.removeItem("token");
  }
}

export function getToken() {
  return token;
}

async function parseJsonSafe(res) {
  // read text first; handle empty body gracefully
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    // if response isn't JSON, return raw text for better debugging
    return text;
  }
}

export async function get(url) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const parsed = await parseJsonSafe(res);
  if (!res.ok) {
    // include status for clearer errors
    const message = parsed || `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return parsed;
}

export async function post(url, data) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  const parsed = await parseJsonSafe(res);
  if (!res.ok) {
    const message = parsed || `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return parsed;
}

export async function put(url, data) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  const parsed = await parseJsonSafe(res);
  if (!res.ok) {
    const message = parsed || `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return parsed;
}

export async function del(url) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const parsed = await parseJsonSafe(res);
  if (!res.ok) {
    const message = parsed || `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return parsed;
}
