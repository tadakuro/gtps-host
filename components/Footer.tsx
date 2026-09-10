export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-1 px-4 text-center sm:px-6">
        <p className="text-sm text-zinc-400">Not affiliated with Ubisoft</p>
        <p className="text-xs text-zinc-600">
          Growtopia is a trademark of Ubisoft. This is a community-run private
          server resource.
        </p>
      </div>
    </footer>
  );
}