import fs from "node:fs";
import path from "node:path";
import type { ServerData, ServerStatus } from "./types";
import serverJson from "@/app/data/server.json";

const DATA_FILE = path.join(process.cwd(), "app", "data", "server.json");
const BUNDLED_DATA = serverJson as ServerData;

const STATUSES: ServerStatus[] = ["Online", "Offline", "Maintenance"];
const MAX_ARRAY = 50;

export function normalizeData(raw: unknown): ServerData {
  const base: ServerData = {
    serverName: "My GTPS Server",
    status: "Online",
    description: "",
    ip: "0.0.0.0",
    port: 17091,
    version: "4.98",
    features: [],
    hosts: [],
  };

  if (!raw || typeof raw !== "object") return base;
  const src = raw as Record<string, unknown>;

  const str = (v: unknown): string => (typeof v === "string" ? v : "");
  const strList = (v: unknown): string[] =>
    Array.isArray(v)
      ? v.filter((x): x is string => typeof x === "string").slice(0, MAX_ARRAY)
      : [];

  let status: ServerStatus = "Online";
  if (STATUSES.includes(src.status as ServerStatus)) {
    status = src.status as ServerStatus;
  }

  const port = typeof src.port === "number" ? src.port : Number(src.port);

  return {
    serverName: str(src.serverName).trim() || base.serverName,
    status,
    description: str(src.description).trim(),
    ip: str(src.ip).trim() || base.ip,
    port: Number.isFinite(port) ? port : base.port,
    version: str(src.version).trim() || base.version,
    features: strList(src.features),
    hosts: strList(src.hosts),
  };
}

export function getServerData(): ServerData {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return normalizeData(JSON.parse(raw));
  } catch {
    return BUNDLED_DATA;
  }
}

export function writeServerData(data: ServerData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf-8");
}