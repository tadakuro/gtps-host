"use client";

import { useCallback, useState } from "react";
import type {
  ServerData,
  ServerStatus,
  SocialLink,
  DownloadCard,
  DownloadButton,
} from "@/lib/types";

const STATUSES: ServerStatus[] = ["Online", "Offline", "Maintenance"];
const BG_TYPES = ["none", "video", "image"] as const;

interface FormState {
  serverName: string;
  tagline: string;
  status: ServerStatus;
  description: string;
  ip: string;
  port: string;
  version: string;
  features: string;
  hosts: string;
  bgType: string;
  bgMediaUrl: string;
  bgOpacity: string;
  eyeEnabled: boolean;
  eyeImageUrl: string;
  speechText: string;
  socialLinks: SocialLink[];
  downloadHeading: string;
  hostFileName: string;
  downloadCards: DownloadCard[];
  showPowerTunnelSection: boolean;
  showIosSection: boolean;
  showPcSection: boolean;
  pcNote: string;
  footerNote: string;
}

function toFormState(data: ServerData): FormState {
  return {
    serverName: data.serverName,
    tagline: data.tagline,
    status: data.status,
    description: data.description,
    ip: data.ip,
    port: String(data.port),
    version: data.version,
    features: data.features.join("\n"),
    hosts: data.hosts.join("\n"),
    bgType: data.background.type,
    bgMediaUrl: data.background.mediaUrl,
    bgOpacity: String(data.background.overlayOpacity),
    eyeEnabled: data.eyeEnabled,
    eyeImageUrl: data.eyeImageUrl,
    speechText: data.speechText,
    socialLinks: data.socialLinks.map((l) => ({ ...l })),
    downloadHeading: data.downloadHeading,
    hostFileName: data.hostFileName,
    downloadCards: data.downloadCards.map((c) => ({
      ...c,
      buttons: c.buttons.map((b) => ({ ...b })),
    })),
    showPowerTunnelSection: data.showPowerTunnelSection,
    showIosSection: data.showIosSection,
    showPcSection: data.showPcSection,
    pcNote: data.pcNote,
    footerNote: data.footerNote,
  };
}

function toPayload(form: FormState): ServerData {
  return {
    serverName: form.serverName.trim(),
    tagline: form.tagline.trim(),
    status: form.status,
    description: form.description.trim(),
    ip: form.ip.trim(),
    port: Math.max(1, Math.floor(Number(form.port) || 17091)),
    version: form.version.trim(),
    features: form.features
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    hosts: form.hosts
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    background: {
      type: form.bgType as "video" | "image" | "none",
      mediaUrl: form.bgMediaUrl.trim(),
      overlayOpacity: Math.max(0, Math.min(100, Number(form.bgOpacity) || 55)),
    },
    eyeEnabled: form.eyeEnabled,
    eyeImageUrl: form.eyeImageUrl.trim(),
    speechText: form.speechText.trim(),
    socialLinks: form.socialLinks.filter((l) => l.label || l.url),
    downloadHeading: form.downloadHeading.trim() || "Download",
    hostFileName: form.hostFileName.trim() || "host.txt",
    downloadCards: form.downloadCards.filter((c) => c.title),
    showPowerTunnelSection: form.showPowerTunnelSection,
    showIosSection: form.showIosSection,
    showPcSection: form.showPcSection,
    pcNote: form.pcNote.trim(),
    footerNote: form.footerNote.trim(),
  };
}

function emptyCard(): DownloadCard {
  return { title: "", subtitle: "", note: "", copyText: "", hostBlock: false, buttons: [] };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 border-b border-white/10 pb-2 text-lg font-bold text-neon font-orbitron">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function emptyButton(): DownloadButton {
  return { type: "link", label: "", url: "" };
}

interface AdminFormProps {
  token: string;
  initial: ServerData;
}

export default function AdminForm({ token, initial }: AdminFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
    },
    []
  );

  const updateSocial = useCallback(
    (i: number, field: keyof SocialLink, val: string) => {
      setForm((f) => {
        const copy = f.socialLinks.map((l) => ({ ...l }));
        copy[i] = { ...copy[i], [field]: val };
        return { ...f, socialLinks: copy };
      });
    },
    []
  );
  const addSocial = useCallback(() => {
    setForm((f) => ({
      ...f,
      socialLinks: [...f.socialLinks, { label: "", url: "", iconUrl: "" }],
    }));
  }, []);
  const removeSocial = useCallback((i: number) => {
    setForm((f) => ({
      ...f,
      socialLinks: f.socialLinks.filter((_, idx) => idx !== i),
    }));
  }, []);

  const updateCard = useCallback(
    (i: number, field: keyof DownloadCard, val: string | boolean) => {
      setForm((f) => {
        const copy = f.downloadCards.map((c) => ({
          ...c,
          buttons: c.buttons.map((b) => ({ ...b })),
        }));
        (copy[i] as Record<string, unknown>)[field] = val;
        return { ...f, downloadCards: copy };
      });
    },
    []
  );
  const addCard = useCallback(() => {
    setForm((f) => ({
      ...f,
      downloadCards: [...f.downloadCards, emptyCard()],
    }));
  }, []);
  const removeCard = useCallback((i: number) => {
    setForm((f) => ({
      ...f,
      downloadCards: f.downloadCards.filter((_, idx) => idx !== i),
    }));
  }, []);

  const updateBtn = useCallback(
    (ci: number, bi: number, field: keyof DownloadButton, val: string) => {
      setForm((f) => {
        const copy = f.downloadCards.map((c) => ({
          ...c,
          buttons: c.buttons.map((b) => ({ ...b })),
        }));
        copy[ci].buttons[bi] = { ...copy[ci].buttons[bi], [field]: val };
        return { ...f, downloadCards: copy };
      });
    },
    []
  );
  const addBtn = useCallback((ci: number) => {
    setForm((f) => {
      const copy = f.downloadCards.map((c) => ({
        ...c,
        buttons: c.buttons.map((b) => ({ ...b })),
      }));
      copy[ci].buttons.push(emptyButton());
      return { ...f, downloadCards: copy };
    });
  }, []);
  const removeBtn = useCallback((ci: number, bi: number) => {
    setForm((f) => {
      const copy = f.downloadCards.map((c) => ({
        ...c,
        buttons: c.buttons.map((b) => ({ ...b })),
      }));
      copy[ci].buttons = copy[ci].buttons.filter((_, idx) => idx !== bi);
      return { ...f, downloadCards: copy };
    });
  }, []);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setResult(null);

      const payload = toPayload(form);

      try {
        const res = await fetch("/api/admin/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": token,
          },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          setResult({
            kind: "success",
            message: (json as { message?: string }).message ?? "Berhasil disimpan.",
          });
          setForm(toFormState(payload));
        } else {
          setResult({
            kind: "error",
            message: (json as { error?: string }).error ?? "Gagal memperbarui.",
          });
        }
      } catch {
        setResult({ kind: "error", message: "Jaringan error." });
      } finally {
        setSaving(false);
      }
    },
    [form, token]
  );

  return (
    <form className="min-w-0" onSubmit={submit}>
      {/* Branding */}
      <Section title="Branding">
        <div>
          <label className="label" htmlFor="serverName">Nama Server</label>
          <input className="input" id="serverName" value={form.serverName} onChange={(e) => set("serverName", e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="tagline">Tagline</label>
          <input className="input" id="tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="SEASON 3 - PRIVATE SERVER" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select className="input" id="status" value={form.status} onChange={(e) => set("status", e.target.value as ServerStatus)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="version">Versi</label>
            <input className="input" id="version" value={form.version} onChange={(e) => set("version", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="description">Deskripsi / Teks Sambutan</label>
            <input className="input" id="description" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="features">Fitur (satu per baris)</label>
          <textarea className="input font-mono text-sm" id="features" rows={3} value={form.features} onChange={(e) => set("features", e.target.value)} placeholder={"Custom World\nMisi Harian\nUptime 24/7"} />
        </div>
        <div>
          <label className="label" htmlFor="footerNote">Catatan Footer</label>
          <input className="input" id="footerNote" value={form.footerNote} onChange={(e) => set("footerNote", e.target.value)} />
        </div>
      </Section>

      {/* Server */}
      <Section title="Info Server">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="ip">Alamat IP</label>
            <input className="input font-mono" id="ip" value={form.ip} onChange={(e) => set("ip", e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="port">Port</label>
            <input className="input font-mono" id="port" type="number" min={1} max={65535} value={form.port} onChange={(e) => set("port", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="hosts">Hosts (satu per baris)</label>
          <textarea className="input font-mono text-sm" id="hosts" rows={4} value={form.hosts} onChange={(e) => set("hosts", e.target.value)} placeholder={"growtopia1.com\nwww.growtopia1.com"} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input className="h-4 w-4 accent-neon" id="showPcSection" type="checkbox" checked={form.showPcSection} onChange={(e) => set("showPcSection", e.target.checked)} />
          <label className="label mb-0" htmlFor="showPcSection">Tampilkan bagian Windows &amp; macOS</label>
        </div>
        {form.showPcSection && (
          <div>
            <label className="label" htmlFor="pcNote">Catatan Bagian PC</label>
            <input className="input" id="pcNote" value={form.pcNote} onChange={(e) => set("pcNote", e.target.value)} placeholder="Catatan opsional di atas daftar host" />
          </div>
        )}
      </Section>

      {/* Background */}
      <Section title="Latar Belakang">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="bgType">Tipe</label>
            <select className="input" id="bgType" value={form.bgType} onChange={(e) => set("bgType", e.target.value)}>
              {BG_TYPES.map((t) => <option key={t} value={t}>{t === "none" ? "Tanpa" : t === "video" ? "Video" : "Gambar"}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="bgMediaUrl">URL Media (video .mp4 atau gambar)</label>
            <input className="input font-mono" id="bgMediaUrl" value={form.bgMediaUrl} onChange={(e) => set("bgMediaUrl", e.target.value)} placeholder="https://..." disabled={form.bgType === "none"} />
          </div>
        </div>
        {form.bgType !== "none" && (
          <div>
            <label className="label" htmlFor="bgOpacity">Kegelapan Overlay: {form.bgOpacity}%</label>
            <input className="w-full accent-neon" id="bgOpacity" type="range" min={0} max={90} value={form.bgOpacity} onChange={(e) => set("bgOpacity", e.target.value)} />
          </div>
        )}
      </Section>

      {/* Eye & Speech */}
      <Section title="Maskot Mata & Gelembung Bicara">
        <div className="flex items-center gap-3">
          <input className="h-4 w-4 accent-neon" id="eyeEnabled" type="checkbox" checked={form.eyeEnabled} onChange={(e) => set("eyeEnabled", e.target.checked)} />
          <label className="label mb-0" htmlFor="eyeEnabled">Tampilkan Maskot Mata</label>
        </div>
        {form.eyeEnabled && (
          <>
            <div>
              <label className="label" htmlFor="eyeImageUrl">URL Gambar Mata (opsional, kosongkan untuk default)</label>
              <input className="input font-mono" id="eyeImageUrl" value={form.eyeImageUrl} onChange={(e) => set("eyeImageUrl", e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="label" htmlFor="speechText">Teks Gelembung Bicara</label>
              <input className="input" id="speechText" value={form.speechText} onChange={(e) => set("speechText", e.target.value)} placeholder="Halo! Selamat datang di server!" />
            </div>
          </>
        )}
      </Section>

      {/* Social Links */}
      <Section title="Tautan Sosial">
        {form.socialLinks.map((link, i) => (
          <div key={`soc-${i}`} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-[1fr_2fr_auto]">
            <input className="input" value={link.label} onChange={(e) => updateSocial(i, "label", e.target.value)} placeholder="Label (mis. Gabung Discord)" />
            <input className="input font-mono" value={link.url} onChange={(e) => updateSocial(i, "url", e.target.value)} placeholder="https://..." />
            <button type="button" className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-300 hover:bg-red-500/30" onClick={() => removeSocial(i)}>Hapus</button>
          </div>
        ))}
        <button type="button" className="btn-secondary" onClick={addSocial}>+ Tambah Tautan Sosial</button>
      </Section>

      {/* Download Cards */}
      <Section title="Kartu Unduhan">
        <div>
          <label className="label" htmlFor="downloadHeading">Judul Bagian</label>
          <input className="input" id="downloadHeading" value={form.downloadHeading} onChange={(e) => set("downloadHeading", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="hostFileName">Nama File Host</label>
          <input className="input font-mono" id="hostFileName" value={form.hostFileName} onChange={(e) => set("hostFileName", e.target.value)} placeholder="VelQuinTopia" />
          <p className="mt-1 text-xs text-zinc-500">Nama file yang dipakai saat pengunjung mengunduh file host (mis. VelQuinTopia.txt)</p>
        </div>
        <label className="flex items-start gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={form.showPowerTunnelSection}
            onChange={(e) => set("showPowerTunnelSection", e.target.checked)}
          />
          <span>Tampilkan bagian PowerTunnel (tautan file hosts) di bawah kartu</span>
        </label>
        <label className="flex items-start gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={form.showIosSection}
            onChange={(e) => set("showIosSection", e.target.checked)}
          />
          <span>Tampilkan bagian iOS Host (konfigurasi bypass) di bawah kartu</span>
        </label>
        {form.downloadCards.map((card, ci) => (
          <div key={`dcard-${ci}`} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-neon">Kartu {ci + 1}</span>
              <button type="button" className="rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-300 hover:bg-red-500/30" onClick={() => removeCard(ci)}>Hapus Kartu</button>
            </div>
            <div className="space-y-3">
              <input className="input" value={card.title} onChange={(e) => updateCard(ci, "title", e.target.value)} placeholder="Judul (mis. APK VELQUIN)" />
              <input className="input" value={card.subtitle} onChange={(e) => updateCard(ci, "subtitle", e.target.value)} placeholder="Subjudul (opsional)" />
              <input className="input" value={card.note} onChange={(e) => updateCard(ci, "note", e.target.value)} placeholder="Teks catatan (opsional)" />
              <input className="input font-mono" value={card.copyText} onChange={(e) => updateCard(ci, "copyText", e.target.value)} placeholder="Teks yang bisa disalin (opsional, muncul di kotak putus-putus)" />
              <label className="flex items-start gap-2 text-xs text-zinc-400">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={card.hostBlock}
                  onChange={(e) => updateCard(ci, "hostBlock", e.target.checked)}
                />
                <span>
                  Otomatis buat konfigurasi host iOS dari field IP + hosts
                  (mengabaikan teks di atas)
                </span>
              </label>
              {/* Buttons per card */}
              <div className="mt-2">
                <p className="mb-2 text-xs text-zinc-500">Tombol</p>
                {card.buttons.map((btn, bi) => (
                  <div key={`dbtn-${ci}-${bi}`} className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select className="input w-auto shrink-0" value={btn.type} onChange={(e) => updateBtn(ci, bi, "type", e.target.value)}>
                      <option value="link">Tautan</option>
                      <option value="host">Unduh File Host</option>
                      <option value="copylink">Salin Tautan Host</option>
                    </select>
                    <input className="input flex-1" value={btn.label} onChange={(e) => updateBtn(ci, bi, "label", e.target.value)} placeholder="Label tombol" />
                    {btn.type === "host" ? (
                      <span className="text-xs text-zinc-500">Mengunduh {(form.hostFileName || "host").replace(/[^a-zA-Z0-9]/g, "") || "host"}.txt</span>
                    ) : btn.type === "copylink" ? (
                      <span className="text-xs text-zinc-500">Menyalin URL host.txt</span>
                    ) : (
                      <input className="input flex-1 font-mono" value={btn.url} onChange={(e) => updateBtn(ci, bi, "url", e.target.value)} placeholder="URL tombol" />
                    )}
                    <button type="button" className="shrink-0 rounded-lg bg-red-500/20 px-2 text-sm text-red-300 hover:bg-red-500/30" onClick={() => removeBtn(ci, bi)}>✕</button>
                  </div>
                ))}
                <button type="button" className="text-sm text-neon hover:underline" onClick={() => addBtn(ci)}>+ Tambah Tombol</button>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="btn-secondary" onClick={addCard}>+ Tambah Kartu Unduhan</button>
      </Section>

      {/* Result message */}
      {result && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            result.kind === "success"
              ? "border-neon/30 bg-neon/10 text-neon"
              : "border-red-400/30 bg-red-500/10 text-red-300"
          }`}
          role="status"
        >
          {result.message}
        </div>
      )}

      {/* Submit */}
      <div className="mb-6">
        <button className="btn-primary w-full sm:w-auto" disabled={saving} type="submit">
          {saving ? "Menyimpan…" : "Simpan Perubahan"}
        </button>
      </div>

      <p className="text-xs text-zinc-600">
        Tips: Di Cloudflare Pages, file bersifat read-only saat runtime. Simpan
        saat dijalankan secara lokal, commit{" "}
        <code>app/data/server.json</code>, lalu push untuk redeploy — atau
        setel <code>DEPLOY_WEBHOOK_URL</code>.
      </p>
    </form>
  );
}