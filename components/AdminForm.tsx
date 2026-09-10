"use client";

import { useCallback, useState } from "react";
import type { ServerData, ServerStatus } from "@/lib/types";

const STATUSES: ServerStatus[] = ["Online", "Offline", "Maintenance"];

interface AdminFormProps {
  token: string;
  initial: ServerData;
}

interface FormState {
  serverName: string;
  status: ServerStatus;
  description: string;
  ip: string;
  port: string;
  version: string;
  features: string;
  hosts: string;
}

function toFormState(data: ServerData): FormState {
  return {
    serverName: data.serverName,
    status: data.status,
    description: data.description,
    ip: data.ip,
    port: String(data.port),
    version: data.version,
    features: data.features.join("\n"),
    hosts: data.hosts.join("\n"),
  };
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

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setResult(null);

      const payload: ServerData = {
        serverName: form.serverName.trim(),
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
      };

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
            message:
              (json as { message?: string }).message ??
              "Saved successfully.",
          });
          setForm(toFormState(payload));
        } else {
          setResult({
            kind: "error",
            message:
              (json as { error?: string }).error ?? "Update failed.",
          });
        }
      } catch {
        setResult({ kind: "error", message: "Network error." });
      } finally {
        setSaving(false);
      }
    },
    [form, token]
  );

  return (
    <form className="min-w-0" onSubmit={submit}>
      <div className="space-y-5">
        <div>
          <label className="label" htmlFor="serverName">
            Server name
          </label>
          <input
            className="input"
            id="serverName"
            type="text"
            value={form.serverName}
            onChange={(e) => set("serverName", e.target.value)}
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="status">
              Status
            </label>
            <select
              className="input"
              id="status"
              value={form.status}
              onChange={(e) => set("status", e.target.value as ServerStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="ip">
              IP address
            </label>
            <input
              className="input font-mono"
              id="ip"
              type="text"
              value={form.ip}
              onChange={(e) => set("ip", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="port">
              Port
            </label>
            <input
              className="input font-mono"
              id="port"
              type="number"
              min={1}
              max={65535}
              value={form.port}
              onChange={(e) => set("port", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="version">
            Version
          </label>
          <input
            className="input"
            id="version"
            type="text"
            value={form.version}
            onChange={(e) => set("version", e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea
            className="input resize-y"
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="features">
            Features (one per line)
          </label>
          <textarea
            className="input resize-y font-mono text-sm"
            id="features"
            rows={3}
            value={form.features}
            onChange={(e) => set("features", e.target.value)}
            placeholder={"Custom World\nDaily Quest"}
          />
        </div>

        <div>
          <label className="label" htmlFor="hosts">
            Hosts (one per line)
          </label>
          <textarea
            className="input resize-y font-mono text-sm"
            id="hosts"
            rows={4}
            value={form.hosts}
            onChange={(e) => set("hosts", e.target.value)}
            placeholder={"growtopia1.com\nwww.growtopia1.com"}
          />
        </div>
      </div>

      {result && (
        <div
          className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
            result.kind === "success"
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-400/30 bg-red-500/10 text-red-300"
          }`}
          role="status"
        >
          {result.message}
        </div>
      )}

      <div className="mt-6">
        <button
          className="btn-primary w-full sm:w-auto"
          disabled={saving}
          type="submit"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <p className="mt-4 text-xs text-zinc-600">
        Tip: on Cloudflare Pages the file is read-only at runtime. Save while
        running the site locally, commit the new{" "}
        <code>app/data/server.json</code>, and push to redeploy — or configure
        <code> DEPLOY_WEBHOOK_URL</code>.
      </p>
    </form>
  );
}