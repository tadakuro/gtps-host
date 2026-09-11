"use client";

import { useState } from "react";

export default function HostButtons() {
  const [copied, setCopied] = useState(false);

  const copyHostUrl = async () => {
    const url = `${window.location.origin}/r/host.txt`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a className="btn-neon" href="/r/host.txt" download="host.txt">
        Download Host
      </a>
      <button className="btn-neon" onClick={copyHostUrl} type="button">
        {copied ? "✓ Copied!" : "Copy for PowerTunnel"}
      </button>
    </div>
  );
}
