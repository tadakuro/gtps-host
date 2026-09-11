export type ServerStatus = "Online" | "Offline" | "Maintenance";
export type BackgroundType = "video" | "image" | "none";

export interface BackgroundConfig {
  type: BackgroundType;
  mediaUrl: string;
  overlayOpacity: number;
}

export interface SocialLink {
  label: string;
  url: string;
  iconUrl: string;
}

export interface DownloadButton {
  type: "link" | "host";
  label: string;
  url: string;
}

export interface DownloadCard {
  title: string;
  subtitle: string;
  note: string;
  copyText: string;
  hostBlock: boolean;
  buttons: DownloadButton[];
}

export interface ServerData {
  serverName: string;
  tagline: string;
  status: ServerStatus;
  description: string;
  ip: string;
  port: number;
  version: string;
  features: string[];
  hosts: string[];
  background: BackgroundConfig;
  eyeEnabled: boolean;
  eyeImageUrl: string;
  speechText: string;
  socialLinks: SocialLink[];
  downloadHeading: string;
  downloadCards: DownloadCard[];
  showHostFileSection: boolean;
  showPcSection: boolean;
  pcNote: string;
  footerNote: string;
}
