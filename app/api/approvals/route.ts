import { NextResponse } from "next/server";import { queryJson, execSql, esc } from "@/lib/db";import { requestApproval } from "@/lib/runtime";
export async function GET(){return NextResponse.json(queryJson("SELECT * FROM approvals ORDER BY requested_at DESC LIMIT 50;"));}
export async function POST(req:Request){const b=await req.json();const id=requestApproval(b.entityType,b.entityId,b.action,b.reason??'manual request');return NextResponse.json({ok:true,id});}
export async function PATCH(req:Request){const b=await req.json();execSql(`UPDATE approvals SET status='${esc(b.status)}', resolved_at=datetime('now') WHERE id='${esc(b.id)}';`);return NextResponse.json({ok:true});}
