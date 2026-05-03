import { readState } from "@/lib/state";
export default async function Page(){const s=await readState();return <div><h1>Workflow Automations</h1>{s.workflows.map(w=><div className='card' key={w.id}><b>{w.name}</b> <span className='badge'>{w.status}</span><p>Retries: {w.retryCount}/{w.maxRetries}. Stop control: simulated manual stop.</p><p>{w.logOutput}</p></div>)}</div>}
