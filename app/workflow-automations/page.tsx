"use client";
import { useEffect, useState } from "react";
export default function Page(){const [rows,setRows]=useState<any[]>([]);const [msg,setMsg]=useState('');const load=async()=>setRows(await (await fetch('/api/workflows')).json());useEffect(()=>{load();},[]);async function run(id:string){setMsg('Running...');const r=await fetch('/api/simulate-workflow',{method:'POST',body:JSON.stringify({id})});const j=await r.json();setMsg(JSON.stringify(j));load();}
return <div><h1>Workflow Automations</h1>{rows.map(w=><div className='card' key={w.id}><b>{w.name}</b> <span className='badge'>{w.status}</span><p>Retries {w.retry_count}/{w.max_retries}</p><p>{w.failure_explanation}</p><button onClick={()=>run(w.id)}>Simulate Run (anti-hang enforced)</button></div>)}<p>{msg}</p></div>}
