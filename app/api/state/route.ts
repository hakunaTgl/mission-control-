import { NextResponse } from "next/server";
import { readState, writeState } from "@/lib/state";

export async function GET() { return NextResponse.json(await readState()); }

export async function POST(req: Request) {
  const body = await req.json();
  await writeState(body);
  return NextResponse.json({ ok: true });
}
