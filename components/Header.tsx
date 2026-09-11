import { getServerData } from "@/lib/server-data";

export default async function Header() {
  const data = await getServerData();

  return (
    <header className="sticky top-0 z-[100] border-b-2 border-neon bg-black/[0.88] backdrop-blur-md">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 text-center sm:px-6">
        <div className="mx-auto w-fit font-orbitron text-[clamp(1.6rem,6.5vw,2.7rem)] font-bold leading-tight text-transparent bg-gradient-to-r from-neon to-neon-light bg-clip-text">
          {data.serverName}
        </div>
        {data.tagline && (
          <p className="mx-auto mt-1 w-fit text-[clamp(0.95rem,3.8vw,1.1rem)] text-neon-light">
            {data.tagline}
          </p>
        )}
      </div>
    </header>
  );
}