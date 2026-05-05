import { NextResponse } from "next/server";
import { initDb, queryJson, execSql, esc } from "@/lib/db";
import { seedFromJsonIfEmpty } from "@/lib/seed";
import { randomUUID } from "crypto";

export async function GET(){initDb();await seedFromJsonIfEmpty();return NextResponse.json(queryJson("SELECT * FROM projects ORDER BY updated_date DESC;"));}
export async function POST(req:Request){const b=await req.json();if(!b.name) return NextResponse.json({error:'name required'},{status:400});const id=esc(b.id??randomUUID());execSql(`INSERT INTO projects VALUES ('${id}','${esc(b.name)}','${esc(b.category??'Experimental')}','${esc(b.status??'idea')}','${esc(b.priority??'medium')}','${esc(b.description??'')}','${esc(b.next_action??'')}','[]','${esc(b.owner??'Founder')}',date('now'),date('now'));`);return NextResponse.json({ok:true,id});}
export async function PATCH(req:Request){const b=await req.json();if(!b.id) return NextResponse.json({error:'id required'},{status:400});execSql(`UPDATE projects SET name='${esc(b.name??'')}', status='${esc(b.status??'idea')}', updated_date=date('now') WHERE id='${esc(b.id)}';`);return NextResponse.json({ok:true});}
