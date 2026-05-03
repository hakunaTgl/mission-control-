import { readState } from "@/lib/state";
export default async function Page(){const s=await readState();return <div><h1>Memory Vault</h1>{s.memory.map(m=><div className='card' key={m.id}><b>{m.title}</b> <span className='badge'>{m.type}</span><p>{m.content}</p></div>)}</div>}
