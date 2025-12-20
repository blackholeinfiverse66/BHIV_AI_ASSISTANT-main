const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

if (!RAW_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

if (!API_KEY) {
  throw new Error("VITE_API_KEY is not defined");
}

// ✅ normalize base URL ONCE
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

export async function apiPost(path: string, payload: any): Promise<any> {
  // ✅ enforce /api prefix and leading slash
  const normalizedPath = path.startsWith("/api/")
    ? path
    : `/api${path.startsWith("/") ? "" : "/"}${path}`;

  const url = `${BASE_URL}${normalizedPath}`;

  console.log("FINAL API URL:", url); // TEMPORARY

  const isFormData = payload instanceof FormData;

  const res = await fetch(url, {
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
