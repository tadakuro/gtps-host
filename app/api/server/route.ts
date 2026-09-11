import { NextResponse } from "next/server";
import { getServerData } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getServerData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
    },
  });
}