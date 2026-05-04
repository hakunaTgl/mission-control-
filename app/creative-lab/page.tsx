import { readState } from "@/lib/state";
export default async function Page(){const s=await readState();return <div><h1>Creative Lab</h1>{s.creative.map(c=><div className='card' key={c.id}><b>{c.title}</b> <span className='badge'>{c.type}</span><p>{c.content}</p></div>)}</div>}
