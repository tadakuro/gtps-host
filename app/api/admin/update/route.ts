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
    return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format JSON gak valid" },
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
          "Data belum lengkap: nama server, IP, dan minimal satu host wajib diisi",
      },
      { status: 400 }
    );
  }

  try {
    await writeServerData(normalized);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "Gagal menyimpan data. Kalau jalan di Cloudflare, pastikan binding GTPS_KV namespace sudah di-pasang.",
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
      "Berhasil disimpan! Perubahan sudah aktif di situs." +
      (process.env.DEPLOY_WEBHOOK_URL
        ? " Webhook redeploy juga sudah dijalankan."
        : ""),
    data,
  });
}