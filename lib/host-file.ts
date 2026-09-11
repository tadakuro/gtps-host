import type { ServerData } from "./types";

export function buildHostContent(data: ServerData): string {
  const lines = data.hosts.map((host) => `${data.ip} ${host}`.trim());
  const body = lines.join("\n");
  return body ? body + "\n" : "";
}

export function buildHostFileName(serverName: string): string {
  const clean = serverName.replace(/[^a-zA-Z0-9]/g, "").trim();
  return (clean || "host") + ".txt";
}

export function buildPtunnelConfig(data: ServerData): string {
  const hosts = data.hosts.map((host) => `${host} = ${data.ip}`).join("\n");
  return [
    "[General]",
    "bypass-system = true",
    "",
    "[Rule]",
    "FINAL,DIRECT",
    "",
    "[Host]",
    hosts,
  ].join("\n");
}