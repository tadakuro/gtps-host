import type { ServerData } from "./types";

export function buildHostContent(data: ServerData): string {
  const lines = data.hosts.map((host) => `${data.ip} ${host}`.trim());
  const body = lines.join("\n");
  return body ? body + "\n" : "";
}