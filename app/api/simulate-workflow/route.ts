import { NextResponse } from "next/server";import { simulateWorkflowRun } from "@/lib/runtime";
export async function POST(req:Request){const b=await req.json();return NextResponse.json(simulateWorkflowRun(b.id));}
