import type { ServerData } from "./types";

export function buildHostContent(data: ServerData): string {
  const lines = data.hosts.map((host) => `${data.ip} ${host}`.trim());
  const body = lines.join("\n");
  return body ? body + "\n" : "";
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