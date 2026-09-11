import { getServerData } from "@/lib/server-data";
import { buildHostContent } from "@/lib/host-file";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = buildHostContent(await getServerData());

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control":
        "public, s-maxage=300, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}