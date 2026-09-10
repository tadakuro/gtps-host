import { headers } from "next/headers";
import { getServerData } from "@/lib/server-data";
import HostButtons from "@/components/HostButtons";
import StatusBadge from "@/components/StatusBadge";

function featureIcon(index: number) {
  switch (index % 4) {
    case 0:
      return "✦";
    case 1:
      return "◆";
    case 2:
      return "★";
    default:
      return "●";
  }
}

export default function HomePage() {
  const data = getServerData();

  const headerList = headers();
  const host = headerList.get("host") ?? "yourdomain.com";
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${protocol}://${host.replace(/:\d+$/, "")}`;
  const hostFileUrl = `${siteUrl.replace(/\/$/, "")}/r/host.txt`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
      {/* Hero */}
      <section className="pt-14 text-center sm:pt-24">
        <div className="mb-4 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-4xl font-black text-night-900 shadow-xl shadow-emerald-500/20">
            {(data.serverName.trim()[0] || "G").toUpperCase()}
          </div>
        </div>
        <div className="mb-4 flex items-center justify-center">
          <StatusBadge status={data.status} />
        </div>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
          {data.serverName}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
          {data.description}
        </p>
      </section>

      {/* About This Server */}
      <section className="mt-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          About This Server
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="card">
            <p className="text-xs uppercase tracking-wider text-zinc-500">IP</p>
            <p className="mt-1 font-mono text-lg font-semibold break-all">
              {data.ip}
            </p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Port
            </p>
            <p className="mt-1 font-mono text-lg font-semibold">{data.port}</p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Version
            </p>
            <p className="mt-1 font-mono text-lg font-semibold">
              {data.version}
            </p>
          </div>
        </div>

        <div className="card mt-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Description
          </p>
          <p className="mt-2 text-zinc-300">{data.description}</p>

          {data.features.length > 0 && (
            <>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Features
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {data.features.map((feature, i) => (
                  <li
                    key={feature + String(i)}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300"
                  >
                    <span className="text-emerald-400">{featureIcon(i)}</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      {/* Host File */}
      <section className="mt-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          Host File
        </h2>
        <div className="card mt-5">
          <p className="text-zinc-300">
            Add the host file to your Growtopia installation directory, or use
            one of the buttons below for a client / proxy that supports custom
            host URLs.
          </p>

          <div className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-night-900 p-4">
            <code className="font-mono text-sm text-emerald-300 break-all">
              {hostFileUrl}
            </code>
          </div>

          <div className="mt-5">
            <HostButtons />
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            Raw file also available without the <code>.txt</code> extension at{" "}
            <code className="text-zinc-400">/r/host</code>.
          </p>
        </div>
      </section>

      {/* How to Use */}
      <section className="mt-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          How to Use
        </h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                ⚡
              </div>
              <h3 className="text-lg font-bold">PowerTunnel</h3>
            </div>
            <ol className="mt-4 space-y-3 text-sm text-zinc-300">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-zinc-300">
                  1
                </span>
                Install PowerTunnel on your device.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-zinc-300">
                  2
                </span>
                Open PowerTunnel settings and find the host file / hosts editor.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-zinc-300">
                  3
                </span>
                Paste the host file URL (use the Copy button above).
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-zinc-300">
                  4
                </span>
                Start the tunnel and launch Growtopia.
              </li>
            </ol>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
                🌱
              </div>
              <h3 className="text-lg font-bold">GrowVPN</h3>
            </div>
            <ol className="mt-4 space-y-3 text-sm text-zinc-300">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-zinc-300">
                  1
                </span>
                Install GrowVPN from your platform&apos;s store.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-zinc-300">
                  2
                </span>
                Tap the settings icon and turn on custom host file.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-zinc-300">
                  3
                </span>
                Download the host file with the Download button above and import
                it into GrowVPN.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-zinc-300">
                  4
                </span>
                Connect and launch Growtopia.
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}