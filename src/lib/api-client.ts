"use client";
/** fetch wrapper for same-origin JSON mutations; always sends the CSRF header. */
export async function api<T = Record<string, unknown>>(url: string, opts: { method?: string; body?: unknown } = {}) {
  const res = await fetch(url, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers: { "Content-Type": "application/json", "x-m4w-csrf": "1" },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: "same-origin",
  });
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const err = new Error(String(data.error ?? res.status)) as Error & { status: number; data: Record<string, unknown> };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export function errorMessage(e: unknown) {
  const err = e as { message?: string; data?: { issues?: { path: string; message: string }[]; message?: string } };
  if (err?.data?.issues?.length) return err.data.issues.map((i) => `${i.path}: ${i.message}`).join(" · ");
  if (err?.data?.message) return err.data.message;
  const map: Record<string, string> = {
    unauthorized: "Your session has expired. Please sign in again.",
    forbidden: "You don’t have permission to do that.",
    rate_limited: "Too many requests. Please wait and try again.",
    duplicate: "That slug or key is already in use.",
    csrf: "Security check failed. Refresh the page and try again.",
    not_found: "Item not found.",
  };
  return map[err?.message ?? ""] ?? "Something went wrong. Please try again.";
}
