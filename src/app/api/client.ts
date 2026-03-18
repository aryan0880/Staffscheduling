function defaultApiBaseUrl() {
  // Avoid localhost vs 127.0.0.1 mismatches (common cause of "Failed to fetch")
  try {
    const host = window.location.hostname;
    const proto = window.location.protocol;
    return `${proto}//${host}:5000`;
  } catch {
    return "http://localhost:5000";
  }
}

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL?.toString() || defaultApiBaseUrl();

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

async function parseError(res: Response): Promise<ApiError> {
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return {
    status: res.status,
    message: json?.error || res.statusText || "Request failed",
    details: json?.details
  };
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = new Headers(opts.headers || {});
  headers.set("Accept", "application/json");
  if (opts.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (opts.token) headers.set("Authorization", `Bearer ${opts.token}`);

  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as any;
  return (await res.json()) as T;
}

