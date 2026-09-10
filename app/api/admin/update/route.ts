import { NextRequest, NextResponse } from "next/server";
import { normalizeData, writeServerData } from "@/lib/server-data";
import type { ServerData } from "@/lib/types";

export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-admin-token") ?? "";
  const expected = process.env.ADMIN_TOKEN ?? "";

  if (!expected || !token || !safeEqual(token, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const normalized = normalizeData(payload);
  const invalid =
    !normalized.serverName ||
    normalized.hosts.length === 0 ||
    !normalized.ip;
  if (invalid) {
    return NextResponse.json(
      {
        error:
          "Invalid data: serverName, ip and at least one host are required",
      },
      { status: 400 }
    );
  }

  try {
    writeServerData(normalized);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "Could not write app/data/server.json (read-only on Cloudflare Pages). " +
          "Run this locally and commit the change, or configure Cloudflare KV (see README).",
        detail: (err as Error).message,
      },
      { status: 500 }
    );
  }

  const data: ServerData = normalized;

  if (process.env.DEPLOY_WEBHOOK_URL) {
    try {
      await fetch(process.env.DEPLOY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
    } catch {
      // webhook failure is non-fatal
    }
  }

  return NextResponse.json({
    ok: true,
    message:
      "server.json updated." +
      (process.env.DEPLOY_WEBHOOK_URL
        ? " Redeploy webhook fired."
        : " Rebuild/redeploy to publish."),
    data,
  });
}