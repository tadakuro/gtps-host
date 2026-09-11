import { getServerData } from "@/lib/server-data";

export default async function Footer() {
  const data = await getServerData();
  const note = data.footerNote || "Not affiliated with Ubisoft. Growtopia is a trademark of Ubisoft.";

  return (
    <footer className="border-t-2 border-neon bg-black/90 py-12 text-center">
      <p className="text-zinc-400">&copy; 2026 {data.serverName}</p>
      <p className="mt-1 text-xs text-zinc-600">{note}</p>
    </footer>
  );
}