export type ServerStatus = "Online" | "Offline" | "Maintenance";

export interface ServerData {
  serverName: string;
  status: ServerStatus;
  description: string;
  ip: string;
  port: number;
  version: string;
  features: string[];
  hosts: string[];
}