import { getServerData } from "@/lib/server-data";
import StatusBadge from "./StatusBadge";

export default function Header() {
  const data = getServerData();

  return (
    <header className="sticky top-0 z-[100] border-b-2 border-neon bg-black/[0.88] backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center sm:px-6">
        <div className="font-orbitron text-[2.7rem] font-bold leading-tight text-transparent bg-gradient-to-r from-neon to-neon-light bg-clip-text">
          {data.serverName}
        </div>
        {data.tagline && (
          <p className="mt-1 text-[1.1rem] text-neon-light">{data.tagline}</p>
        )}
      </div>
    </header>
  );
}
