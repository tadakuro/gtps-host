import { NextResponse } from "next/server";
import { getServerData } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getServerData(), {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
    },
  });
}