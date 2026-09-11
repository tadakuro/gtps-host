import fs from "node:fs";
import path from "node:path";
import type { ServerData, ServerStatus, BackgroundConfig, BackgroundType, SocialLink, DownloadCard } from "./types";
import serverJson from "@/app/data/server.json";

const DATA_FILE = path.join(process.cwd(), "app", "data", "server.json");
const BUNDLED_DATA = serverJson as ServerData;
const KV_KEY = "server-data";

declare global {
  interface CloudflareEnv {
    GTPS_KV?: {
      get(key: string, type?: "text"): Promise<string | null>;
      put(key: string, value: string): Promise<void>;
    };
  }
}

const STATUSES: ServerStatus[] = ["Online", "Offline", "Maintenance"];
const BG_TYPES: BackgroundType[] = ["video", "image", "none"];
const MAX_ARRAY = 50;

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function num(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function bool(v: unknown): boolean {
  return v === true || v === "true";
}
function strList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string").slice(0, MAX_ARRAY) as string[];
}

function normalizeBackground(raw: unknown): BackgroundConfig {
  const base: BackgroundConfig = { type: "none", mediaUrl: "", overlayOpacity: 55 };
  if (!raw || typeof raw !== "object") return base;
  const s = raw as Record<string, unknown>;
  const type = BG_TYPES.includes(s.type as BackgroundType) ? (s.type as BackgroundType) : "none";
  return {
    type,
    mediaUrl: str(s.mediaUrl),
    overlayOpacity: Math.max(0, Math.min(100, num(s.overlayOpacity, 55))),
  };
}

function normalizeSocialLinks(raw: unknown): SocialLink[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 20).map((item) => {
    if (!item || typeof item !== "object") return null;
    const s = item as Record<string, unknown>;
return {
      iconUrl: str(s.iconUrl).trim(),
      label: str(s.label).trim(),
      url: str(s.url).trim(),
    };
  }).filter((x): x is SocialLink => x !== null && Boolean(x.label || x.url));
}

function normalizeDownloadCards(raw: unknown): DownloadCard[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 10).map((item) => {
    if (!item || typeof item !== "object") return null;
    const s = item as Record<string, unknown>;
    const buttons = Array.isArray(s.buttons)
      ? (s.buttons as unknown[]).slice(0, 10).map((b) => {
          if (!b || typeof b !== "object") return null;
          const bs = b as Record<string, unknown>;
          return { label: str(bs.label), url: str(bs.url) };
        }).filter((x): x is { label: string; url: string } => x !== null && Boolean(x.label || x.url))
      : [];
    return {
      title: str(s.title),
      subtitle: str(s.subtitle),
      note: str(s.note),
      copyText: str(s.copyText),
      hostBlock: bool(s.hostBlock),
      buttons,
    };
  }).filter((x): x is DownloadCard => x !== null && Boolean(x.title));
}

export function normalizeData(raw: unknown): ServerData {
  const base: ServerData = {
    serverName: "My GTPS Server",
    tagline: "",
    status: "Online",
    description: "",
    ip: "0.0.0.0",
    port: 17091,
    version: "4.98",
    features: [],
    hosts: [],
    background: { type: "none", mediaUrl: "", overlayOpacity: 55 },
    eyeEnabled: false,
    eyeImageUrl: "",
    speechText: "",
    socialLinks: [],
    downloadHeading: "Download",
    downloadCards: [],
    showHostFileSection: false,
    showPcSection: true,
    pcNote: "",
    footerNote: "Not affiliated with Ubisoft. Growtopia is a trademark of Ubisoft.",
  };

  if (!raw || typeof raw !== "object") return base;
  const src = raw as Record<string, unknown>;

  let status: ServerStatus = "Online";
  if (STATUSES.includes(src.status as ServerStatus)) {
    status = src.status as ServerStatus;
  }

  const port = num(src.port, 17091);

  return {
    serverName: str(src.serverName).trim() || base.serverName,
    tagline: str(src.tagline).trim(),
    status,
    description: str(src.description).trim(),
    ip: str(src.ip).trim() || base.ip,
    port: Math.max(1, Math.floor(port)),
    version: str(src.version).trim() || base.version,
    features: strList(src.features),
    hosts: strList(src.hosts),
    background: normalizeBackground(src.background),
    eyeEnabled: bool(src.eyeEnabled),
    eyeImageUrl: str(src.eyeImageUrl),
    speechText: str(src.speechText),
    socialLinks: normalizeSocialLinks(src.socialLinks),
    downloadHeading: str(src.downloadHeading).trim() || "Download",
    downloadCards: normalizeDownloadCards(src.downloadCards),
    showHostFileSection: bool(src.showHostFileSection),
    showPcSection: bool(src.showPcSection),
    pcNote: str(src.pcNote).trim(),
    footerNote: str(src.footerNote).trim() || base.footerNote,
  };
}

async function getKv() {
  try {
    const mod = await import("@opennextjs/cloudflare/cloudflare-context");
    const ctx = await mod.getCloudflareContext({ async: true });
    return ctx.env.GTPS_KV ?? null;
  } catch {
    return null;
  }
}

async function readFromKv() {
  const kv = await getKv();
  if (!kv) return null;
  try {
    const raw = await kv.get(KV_KEY);
    return raw ? normalizeData(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export async function getServerData(): Promise<ServerData> {
  const fromKv = await readFromKv();
  if (fromKv) return fromKv;

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return normalizeData(JSON.parse(raw));
  } catch {
    return BUNDLED_DATA;
  }
}

export async function writeServerData(data: ServerData): Promise<void> {
  const kv = await getKv();
  if (kv) {
    await kv.put(KV_KEY, JSON.stringify(data));
    return;
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf-8");
}