import { NextRequest, NextResponse } from "next/server";
import { listEmergency } from "@/lib/emergency";
import { errorMessage, errorStatus } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const lat = Number(req.nextUrl.searchParams.get("lat"));
    const lng = Number(req.nextUrl.searchParams.get("lng"));
    const data = await listEmergency(lat, lng);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: errorStatus(err) });
  }
}
