"use client";

import { useCallback, useState } from "react";

export default function HostButtons() {
  const [copied, setCopied] = useState(false);

  const copyHostUrl = useCallback(async () => {
    const url = `${window.location.origin}/r/host.txt`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a className="btn-primary" href="/r/host.txt" download={"host.txt"}>
        Download Host
      </a>
      <button className="btn-secondary" onClick={copyHostUrl} type="button">
        {copied ? "Copied to clipboard!" : "Copy for PowerTunnel"}
      </button>

      {copied && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-night-900 shadow-xl shadow-emerald-500/30">
            Copied!
          </div>
        </div>
      )}
    </div>
  );
}