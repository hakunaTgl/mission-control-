import { NextResponse } from "next/server";
import { initDb, queryJson, execSql } from "@/lib/db";
import { seedFromJsonIfEmpty } from "@/lib/seed";
import { randomUUID } from "crypto";

export async function GET(){initDb();await seedFromJsonIfEmpty();return NextResponse.json(queryJson("SELECT * FROM projects ORDER BY updated_date DESC;"));}
export async function POST(req:Request){const b=await req.json();if(!b.name) return NextResponse.json({error:'name required'},{status:400});const id=b.id??randomUUID();execSql(`INSERT INTO projects VALUES ('${id}','${b.name}','${b.category??'Experimental'}','${b.status??'idea'}','${b.priority??'medium'}','${b.description??''}','${b.next_action??''}','[]','${b.owner??'Founder'}',date('now'),date('now'));`);return NextResponse.json({ok:true,id});}
export async function PATCH(req:Request){const b=await req.json();if(!b.id) return NextResponse.json({error:'id required'},{status:400});execSql(`UPDATE projects SET name='${(b.name??'').replaceAll("'","''")}', status='${(b.status??'idea').replaceAll("'","''")}', updated_date=date('now') WHERE id='${b.id}';`);return NextResponse.json({ok:true});}
