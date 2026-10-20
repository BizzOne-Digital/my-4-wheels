import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, public code: string, public details?: unknown) {
    super(code);
  }
}

export function json(data: unknown, status = 200, headers?: HeadersInit) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export const CSRF_HEADER = "x-m4w-csrf";

/**
 * CSRF protection for cookie-authenticated mutations:
 * 1. The Origin (or Referer) must match this site's host.
 * 2. A custom header must be present. Browsers will not send custom headers cross-site without
 *    a CORS preflight, which this app never approves.
 * Session cookies are also SameSite=Lax.
 */
export function assertSameOrigin(req: NextRequest | Request) {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;
  if (req.headers.get(CSRF_HEADER) !== "1") throw new HttpError(403, "csrf");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin || !host) throw new HttpError(403, "csrf");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new HttpError(403, "csrf");
  }
  const allowed = new Set([host]);
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).host);
    } catch {}
  }
  if (!allowed.has(originHost)) throw new HttpError(403, "csrf");
}

export function clientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}

type Handler<C> = (req: NextRequest, ctx: C) => Promise<Response>;

/** Wraps a route handler with consistent JSON error responses. */
export function route<C = unknown>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) return json({ success: false, error: e.code, details: e.details }, e.status);
      if (e instanceof ZodError) {
        return json({ success: false, error: "validation", issues: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, 400);
      }
      if (typeof e === "object" && e && (e as { code?: number }).code === 11000) {
        return json({ success: false, error: "duplicate" }, 409);
      }
      if (typeof e === "object" && e && (e as { name?: string }).name === "ValidationError") {
        return json({ success: false, error: "validation", message: (e as Error).message }, 400);
      }
      console.error("[route error]", e);
      return json({ success: false, error: "server_error" }, 500);
    }
  };
}

export async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "invalid_json");
  }
}
