import { NextResponse } from "next/server";import { initDb, queryJson } from "@/lib/db";import { seedFromJsonIfEmpty } from "@/lib/seed";
export async function GET(){initDb();await seedFromJsonIfEmpty();return NextResponse.json(queryJson("SELECT * FROM workflows ORDER BY name;"));}
