const BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_KEY = import.meta.env.VITE_API_KEY

if (!BASE_URL) {
  throw new Error('VITE_API_BASE_URL is missing')
}

if (!API_KEY) {
  throw new Error('VITE_API_KEY is missing')
}

export async function apiPost(path, payload) {
  const isFormData = payload instanceof FormData;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? payload : JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || err.message || "API error");
  }

  return res.json();
}