import type { ServerStatus } from "@/lib/types";

const STYLES: Record<ServerStatus, string> = {
  Online: "bg-neon/10 text-neon ring-neon/40",
  Offline: "bg-red-500/10 text-red-300 ring-red-400/40",
  Maintenance: "bg-amber-500/10 text-amber-300 ring-amber-400/40",
};

const DOT: Record<ServerStatus, string> = {
  Online: "bg-neon",
  Offline: "bg-red-400",
  Maintenance: "bg-amber-400",
};

export default function StatusBadge({ status }: { status: ServerStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${STYLES[status]}`}
    >
      <span className={`h-2 w-2 rounded-full ${DOT[status]}`} />
      {status}
    </span>
  );
}
