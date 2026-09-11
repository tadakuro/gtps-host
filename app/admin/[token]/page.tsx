import { notFound } from "next/navigation";
import { getServerData } from "@/lib/server-data";
import AdminForm from "@/components/AdminForm";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = await params;
  const expected = process.env.ADMIN_TOKEN ?? "";

  if (!expected || token !== expected) {
    notFound();
  }

  const initial = await getServerData();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3">
        <p className="text-sm text-amber-200">
          <span className="font-semibold">Perhatian:</span> Jangan share
          link ini. Siapa pun yang punya akses bisa ubah semua pengaturan
          server.
        </p>
        <span className="shrink-0 text-xl">🔒</span>
      </div>

      <div className="mb-8">
        <h1 className="font-orbitron text-2xl font-black tracking-tight sm:text-3xl">
          Pengaturan Server
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Semua perubahan langsung tersimpan &amp; langsung tampil di situs.
        </p>
      </div>

      <AdminForm token={token} initial={initial} />
    </div>
  );
}
