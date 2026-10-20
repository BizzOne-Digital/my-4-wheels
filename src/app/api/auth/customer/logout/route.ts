import type { NextRequest } from "next/server";
import { assertSameOrigin, json, route } from "@/lib/http";
import { destroySession } from "@/lib/session";

export const runtime = "nodejs";

export const POST = route(async (req: NextRequest) => {
  assertSameOrigin(req);
  await destroySession("customer");
  return json({ success: true });
});
