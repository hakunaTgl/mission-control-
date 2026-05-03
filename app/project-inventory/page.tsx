import { readState } from "@/lib/state";
export default async function Page(){const s=await readState();return <div><h1>Project Inventory</h1>{s.projects.map(p=><div className='card' key={p.id}><b>{p.name}</b> <span className='badge'>{p.status}</span><p>{p.description}</p><p>Next: {p.nextAction}</p></div>)}</div>}
