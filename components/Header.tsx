import { getServerData } from "@/lib/server-data";
import StatusBadge from "./StatusBadge";

export default function Header() {
  const data = getServerData();
  const initial = (data.serverName.trim()[0] || "G").toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-night-900/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-lg font-black text-night-900">
            {initial}
          </div>
          <div>
            <p className="text-base font-bold leading-tight">{data.serverName}</p>
            <p className="text-xs text-zinc-500">GTPS Host Files</p>
          </div>
        </div>
        <StatusBadge status={data.status} />
      </div>
    </header>
  );
}